import path from 'path';
import UmzugClass, { Umzug, Migration } from 'umzug';
import _ from 'lodash';
import type { Sequelize } from 'sequelize';
import type { LoggerFactory } from './logger';
import type { DbModule } from './db';

function onMigrationEnd(exitCode: number) {
    // eslint-disable-next-line no-process-exit
    process.exit(exitCode);
}

function getCurrent(executed: Migration[] | undefined) {
    return _.chain(executed).last().get('file').value() || '<NO_MIGRATIONS>';
}

function getArg(n: number) {
    return _.chain(process.argv)
        .nth(n + 2)
        .trim()
        .value();
}

/**
 * Runs migration script
 *
 * @param {Object} loggerFactory initialized logger factory, see {@link initLogging}
 * @param {DbModule} dbModule DB module, an object containing `init` function and `db` object, see {@link DbModule}
 */
function runMigration(loggerFactory: LoggerFactory, dbModule: DbModule): void {
    const { db, init } = dbModule;

    const migrationFileExtension = '.ts';
    const command = getArg(0);
    if (command === 'current') loggerFactory.logErrorsOnly();
    const logger = loggerFactory.getLogger('DBMigration');

    let umzug: Umzug | undefined;

    function initUmzug() {
        const sequelize = db.sequelize as Sequelize;
        umzug = new UmzugClass({
            storage: 'sequelize',
            storageOptions: {
                sequelize
            },

            // see: https://github.com/sequelize/umzug/issues/17
            migrations: {
                params: [
                    sequelize.getQueryInterface(), // queryInterface
                    sequelize.constructor, // DataTypes
                    logger,
                    // eslint-disable-next-line func-names
                    function () {
                        throw new Error(
                            'Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.'
                        );
                    }
                ],
                path: './migrations',
                pattern: RegExp(`${migrationFileExtension}$`)
            },

            logging(...args: string[]) {
                logger.info(args);
            }
        });

        function logUmzugEvent(eventName: string) {
            return (name: string /* , migration */) => logger.info(`${name} ${eventName}`);
        }
        // @ts-ignore There are no typings available for Umzug v1 and there is no `on` method in Umzug >v1
        umzug.on('migrating', logUmzugEvent('migrating'));
        // @ts-ignore There are no typings available for Umzug v1 and there is no `on` method in Umzug >v1
        umzug.on('migrated', logUmzugEvent('migrated'));
        // @ts-ignore There are no typings available for Umzug v1 and there is no `on` method in Umzug >v1
        umzug.on('reverting', logUmzugEvent('reverting'));
        // @ts-ignore There are no typings available for Umzug v1 and there is no `on` method in Umzug >v1
        umzug.on('reverted', logUmzugEvent('reverted'));
    }

    function cmdStatus() {
        type Result = { executed: Migration[]; pending: Migration[] };
        const result: Result = { executed: [], pending: [] };

        return umzug!
            .executed()
            .then(executed => {
                result.executed = executed;
                return umzug!.pending();
            })
            .then(pending => {
                result.pending = pending;
                return result;
            })
            .then(res => {
                let { executed, pending }: Result = res;

                executed = executed.map(m => ({ ...m, name: path.basename(m.file, migrationFileExtension) }));
                pending = pending.map(m => ({ ...m, name: path.basename(m.file, migrationFileExtension) }));

                const current = getCurrent(executed);
                const status = {
                    current,
                    executed: executed?.map(m => m.file),
                    pending: pending?.map(m => m.file)
                };

                logger.info(JSON.stringify(status, null, 2));

                return { executed, pending };
            });
    }

    function cmdDownTo() {
        const migrationName = getArg(1);
        if (!migrationName || migrationName === '') {
            return Promise.reject(new Error('Migration name to down to has to be supplied'));
        }

        return cmdStatus().then(result => {
            const executed = result.executed.map(m => m.file);
            if (executed.length === 0) {
                throw new Error('Already at initial state');
            }

            const migrationIndex = executed.indexOf(migrationName);
            if (migrationIndex < 0) {
                // If its not found
                throw new Error("Migration doesn't exist or was not executed");
            }
            if (migrationIndex + 1 >= executed.length) {
                // Or if its the last one so we cannot migrate to it - or actually one after it, then ignore)
                logger.info('Migration to downgrade to is the last migration, ignoring');
                return Promise.resolve([]);
            }
            const migrationToMigrateTo = executed[migrationIndex + 1];
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
                _.each(tableNames, tableName => {
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
            return Promise.resolve(getCurrent(executed));
        });
    }

    function cmdReset() {
        return umzug!.down({ to: '0' });
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
            (<Promise<void>>executedCmd)
                .then(() => {
                    const doneStr = `${command.toUpperCase()} DONE`;
                    logger.info(doneStr);
                    logger.info('='.repeat(doneStr.length));

                    if (command !== 'status' && command !== 'reset-hard') {
                        return (cmdStatus() as unknown) as Promise<void>;
                    }
                    return Promise.resolve();
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
