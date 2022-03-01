import _ from 'lodash';
import fs from 'fs';
import axios from 'axios';
import { DataTypes, QueryTypes, Sequelize } from 'sequelize';
import type { Model, ModelCtor, Options, QueryOptionsWithType } from 'sequelize';
import type { LoggerFactory } from './logger';

type Db = { sequelize?: Sequelize } & Record<string, ModelCtor<any>>;
type RestartFunction = (reason: string) => void;
export type DbModule = { db: Db; init: () => Promise<void> };

/**
 * Once initialized this object contains `sequelize` instance as well as all DB models, keyed by model name.
 */
const db: Db = {};

function wait(seconds: number) {
    return new Promise(resolve => setTimeout(resolve, 1000 * seconds));
}

function addHooks(sequelize: Sequelize, restart: RestartFunction) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore afterDisconnect is static method
    sequelize.afterDisconnect(async (connection: unknown) => {
        const { _invalid: unexpectedDisconnection } = connection as { _invalid: boolean };
        if (unexpectedDisconnection) {
            restart('Unexpected disconnection occured.');
        }
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore beforeQuery is not included in TypeScript declaration for sequelize,
    // See: https://github.com/sequelize/sequelize/issues/11441
    sequelize.beforeQuery(async ({ isRecoveryCheck }: { isRecoveryCheck: boolean }) => {
        // eslint-disable-next-line camelcase
        type PgIsInRecoveryQueryResponse = { pg_is_in_recovery: boolean };
        if (!isRecoveryCheck) {
            const result = (await sequelize.query('SELECT pg_is_in_recovery();', {
                plain: true,
                type: QueryTypes.SELECT,
                isRecoveryCheck: true
            } as QueryOptionsWithType<QueryTypes.SELECT> & { plain: true })) as PgIsInRecoveryQueryResponse;
            if (result && result.pg_is_in_recovery) {
                restart('DB is in recovery.');
            }
        }
    });
}

export type DbConfig = { url: string | string[]; options: Pick<Options, 'dialectOptions'> };
export type ModelFactory<M extends Model = any> = (sequelize: Sequelize, dataTypes: typeof DataTypes) => ModelCtor<M>;
export type ModelFactories = ModelFactory<any>[];
/**
 * Constructs new object containing `init` function and `db` object
 *
 * @param {DbConfig} dbConfig DB configuration object
 * @param {LoggerFactory} loggerFactory object containing `getLogger` function
 * @param {ModelFactories} modelFactories array of factory functions returning sequelize model
 *
 * @returns {DbModule} DB module
 */
function getDbModule(dbConfig: DbConfig, loggerFactory: LoggerFactory, modelFactories: ModelFactories): DbModule {
    const logger = loggerFactory.getLogger('DBConnection');

    function addModels(sequelize: Sequelize) {
        modelFactories.forEach(modelFactory => {
            const model = modelFactory(sequelize, DataTypes);
            db[model.name] = model;
        });
    }

    function getDbOptions(configOptions: {
        dialectOptions?: { ssl?: { ca: string; cert: string; key: string } };
    }): Options {
        const options = _.merge(
            {
                logging: (message: string) => logger.debug(message)
            },
            configOptions
        );

        if (options.dialectOptions?.ssl) {
            options.dialectOptions.ssl.ca = fs.readFileSync(options.dialectOptions.ssl.ca, { encoding: 'utf8' });
            if (options.dialectOptions.ssl.cert) {
                // If the cert is provided, the key will also be provided by the installer.
                options.dialectOptions.ssl.cert = fs.readFileSync(options.dialectOptions.ssl.cert, {
                    encoding: 'utf8'
                });
                options.dialectOptions.ssl.key = fs.readFileSync(options.dialectOptions.ssl.key, { encoding: 'utf8' });
            }
        }

        return options;
    }

    async function selectDbUrl() {
        function getHostname(dbUrl: string) {
            return new URL(dbUrl).hostname;
        }
        function isResponding(url: string) {
            const patroniUrl = `https://${getHostname(url)}:8008`;
            return axios(patroniUrl)
                .then(response => response.status === 200)
                .catch(error => {
                    logger.debug(`Error occured when requesting: ${url}.`, error);
                    return false;
                });
        }
        async function findRespondingHost(urls: string[]) {
            let respondingHost = null;

            /* eslint-disable no-await-in-loop */
            do {
                for (let i = 0; i < urls.length; i += 1) {
                    const hostname = getHostname(urls[i]);
                    logger.info(`Checking DB host ${i}: ${hostname}`);
                    const hasResponded = await isResponding(urls[i]);
                    if (hasResponded) {
                        logger.debug(`DB host ${hostname} has responded.`);
                        respondingHost = urls[i];
                        break;
                    } else {
                        logger.debug(`DB host ${hostname} not responding.`);
                    }
                }
                if (!respondingHost) {
                    await wait(1);
                    logger.info(`Retrying DB host selection...`);
                }
            } while (!respondingHost);
            /* eslint-enable no-await-in-loop */

            return respondingHost;
        }

        const { url: dbUrls } = dbConfig;
        let selectedDbUrl = null;

        if (dbUrls && _.isString(dbUrls)) {
            selectedDbUrl = dbUrls;
        } else if (_.isArray(dbUrls)) {
            logger.info('Selecting DB host...');
            selectedDbUrl = await findRespondingHost(dbUrls);
        } else {
            throw new Error(
                'Invalid db.url parameter passed to the configuration. Expected not empty string or array of strings.'
            );
        }

        logger.info(`Selected DB host: ${getHostname(selectedDbUrl)}`);
        return selectedDbUrl;
    }

    async function connect(sequelize: Sequelize, restart: RestartFunction) {
        try {
            await sequelize.authenticate();
            logger.info('DB connection has been established successfully.');
        } catch (error) {
            logger.error(error);
            restart('Unable to connect to the database.');
        }
    }

    /**
     * Initializes DB connection
     *
     * @returns {Promise<void>} promise resolving once connection is established
     */
    async function init() {
        const { options } = dbConfig;
        const dbOptions = getDbOptions(options);
        const dbUrl = await selectDbUrl();
        const sequelize = new Sequelize(dbUrl, dbOptions);
        db.sequelize = sequelize;

        let isRestarting = false;
        async function restart(reason: string) {
            if (!isRestarting) {
                isRestarting = true;
                logger.info(reason);
                logger.info('Closing all DB connections...');
                await sequelize.close();
                logger.info('Re-initializing DB...');
                await wait(1);
                init();
            }
        }

        addModels(sequelize);
        addHooks(sequelize, restart);
        await connect(sequelize, restart);
    }

    return { init, db };
}

export default getDbModule;
