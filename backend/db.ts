import _ from 'lodash';
import fs from 'fs';
import request from 'request';
import { DataTypes, Model, ModelCtor, Options, Sequelize, QueryTypes, QueryOptionsWithType } from 'sequelize';

import type { LoggerFactory } from './logger';

type Db = { sequelize?: Sequelize } & Record<string, Model>;
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
    // @ts-ignore afterDisconnect is static method
    sequelize.afterDisconnect(async (connection: unknown) => {
        const { _invalid: unexpectedDisconnection } = connection as { _invalid: boolean };
        if (unexpectedDisconnection) {
            restart('Unexpected disconnection occured.');
        }
    });

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
export type ModelFactories = ((sequelize: Sequelize, dataTypes: typeof DataTypes) => ModelCtor<any>)[];
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
            // @ts-ignore Typings for sequelize are missing name in Model instance
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
            return new Promise(resolve =>
                request(
                    {
                        url: patroniUrl,
                        strictSSL: false
                    },
                    (error, response) => {
                        if (error) {
                            logger.debug(`Error occured when requesting: ${url}.`, error);
                            resolve(false);
                        } else {
                            resolve(response.statusCode === 200);
                        }
                    }
                )
            );
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
