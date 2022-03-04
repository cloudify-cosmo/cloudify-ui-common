import { Umzug, SequelizeStorage } from 'umzug';
import { chain, each, map, last } from 'lodash';
import { DataTypes } from 'sequelize';
import type { MigrationMeta } from 'umzug';
import type { Sequelize, QueryInterface } from 'sequelize';
import type { Logger, LoggerFactory } from './logger';
import type { DbModule } from './db';

function onMigrationEnd(exitCode: number) {
    // eslint-disable-next-line no-process-exit
    process.exit(exitCode);
}

function changeExtensionToJs(migrationName: string) {
    return migrationName.replace(/\.ts$/, '.js');
}

function toNames(migrations: MigrationMeta[] | undefined) {
    return map(migrations, 'name');
}

function getCurrent(executed: string[]) {
    return last(executed) || '<NO_MIGRATIONS>';
}

function getArg(n: number) {
    return chain(process.argv)
        .nth(n + 2)
        .trim()
        .value();
}

export type UpDownFunction = (
    queryInterface: QueryInterface,
    dataTypes: typeof DataTypes,
    logger: Logger
) => Promise<any>;

/**
 * Runs migration script
 *
 * @param {Object} loggerFactory initialized logger factory, see {@link initLogging}
 * @param {DbModule} dbModule DB module, an object containing `init` function and `db` object, see {@link DbModule}
 */
function runMigration(loggerFactory: LoggerFactory, dbModule: DbModule): void {
    const { db, init } = dbModule;

    const command = getArg(0);
    if (command === 'current') loggerFactory.logErrorsOnly();
    const logger = loggerFactory.getLogger('DBMigration');

    let umzug: Umzug | undefined;

    function initUmzug() {
        const sequelize = db.sequelize as Sequelize;
        umzug = new Umzug({
            storage: new SequelizeStorage({ sequelize }),

            migrations: {
                glob: './migrations/*.ts',
                resolve({ name, path }) {
                    // eslint-disable-next-line global-require,import/no-dynamic-require,@typescript-eslint/no-var-requires
                    const migration = require(path!);
                    const params = [
                        sequelize.getQueryInterface(), // queryInterface
                        sequelize.constructor, // DataTypes
                        logger,
                        // eslint-disable-next-line func-names
                        function () {
                            throw new Error(
                                'Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.'
                            );
                        }
                    ];
                    return {
                        // NOTE: Always changing extension to .js to maintain backward compatibility
                        name: changeExtensionToJs(name),
                        up: async () => migration.up(...params),
                        down: async () => migration.down(...params)
                    };
                }
            },

            logger
        });

        function logUmzugEvent(eventName: string) {
            return (eventData: any) => {
                logger.info(`${eventName}: ${eventData}`);
            };
        }
        umzug.on('migrating', logUmzugEvent('migrating'));
        umzug.on('migrated', logUmzugEvent('migrated'));
        umzug.on('reverting', logUmzugEvent('reverting'));
        umzug.on('reverted', logUmzugEvent('reverted'));
    }

    async function cmdStatus() {
        const executedMigrations: MigrationMeta[] = await umzug!.executed();
        const pendingMigrations: MigrationMeta[] = await umzug!.pending();
        const executedMigrationsNames = toNames(executedMigrations);

        const status = {
            current: getCurrent(executedMigrationsNames),
            executed: executedMigrationsNames,
            pending: toNames(pendingMigrations)
        };
        logger.info(JSON.stringify(status, null, 2));

        return executedMigrationsNames;
    }

    function cmdDownTo() {
        const migrationName = getArg(1);
        if (!migrationName || migrationName === '') {
            return Promise.reject(new Error('Migration name to down to has to be supplied'));
        }

        return cmdStatus().then(executedMigrationsNames => {
            if (executedMigrationsNames.length === 0) {
                throw new Error('Already at initial state');
            }

            const migrationIndex = executedMigrationsNames.indexOf(migrationName);
            if (migrationIndex < 0) {
                // If its not found
                throw new Error("Migration doesn't exist or was not executed");
            }
            if (migrationIndex + 1 >= executedMigrationsNames.length) {
                // Or if its the last one so we cannot migrate to it - or actually one after it, then ignore)
                logger.info('Migration to downgrade to is the last migration, ignoring');
                return Promise.resolve([]);
            }
            const migrationToMigrateTo = executedMigrationsNames[migrationIndex + 1];
            return umzug!.down({ to: migrationToMigrateTo });
        });
    }

    function cmdClear() {
        const sequelize = db.sequelize as Sequelize;
        return sequelize
            .getQueryInterface()
            .showAllTables()
            .then(tableNames => {
                const promises: Promise<[unknown[], unknown]>[] = [];
                each(tableNames, tableName => {
                    if (tableName !== 'SequelizeMeta') {
                        logger.info(`Clearing table ${tableName}`);
                        promises.push(sequelize.query(`truncate "${tableName}"`));
                    }
                });

                return Promise.all(promises);
            });
    }

    function cmdMigrate() {
        return umzug!.up();
    }

    function cmdCurrent() {
        return umzug!.executed().then(executed => {
            return Promise.resolve(getCurrent(toNames(executed)));
        });
    }

    function cmdReset() {
        return umzug!.down({ to: 0 });
    }

    function handleCommand() {
        if (!command) {
            logger.error(`missing command`);
            onMigrationEnd(1);
        }

        logger.info(`${command.toUpperCase()} BEGIN`);

        let executedCmd;
        switch (command) {
            case 'current':
                // eslint-disable-next-line no-console
                executedCmd = cmdCurrent().then(console.log);
                break;

            case 'status':
                executedCmd = cmdStatus();
                break;

            case 'up':
            case 'migrate':
                executedCmd = cmdMigrate();
                break;

            case 'downTo':
                executedCmd = cmdDownTo();
                break;

            case 'reset':
                executedCmd = cmdReset();
                break;
            case 'clear':
                executedCmd = cmdClear();
                break;
            default:
                logger.error(`invalid command: ${command}`);
                onMigrationEnd(1);
        }

        if (executedCmd)
            (<Promise<string[]>>executedCmd)
                .then(() => {
                    const doneStr = `${command.toUpperCase()} DONE`;
                    logger.info(doneStr);
                    logger.info('='.repeat(doneStr.length));

                    if (command !== 'status' && command !== 'reset-hard') {
                        return cmdStatus();
                    }
                    return Promise.resolve([]);
                })
                .then(() => onMigrationEnd(0))
                .catch((err: Error) => {
                    const errorStr = `${command.toUpperCase()} ERROR`;
                    logger.error(errorStr);
                    logger.error('='.repeat(errorStr.length));
                    logger.error(err);
                    logger.error('='.repeat(errorStr.length));
                    onMigrationEnd(1);
                });
    }

    init().then(() => {
        initUmzug();
        handleCommand();
    });
}

export default runMigration;
