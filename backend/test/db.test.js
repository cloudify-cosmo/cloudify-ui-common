jest.mock('sequelize');
jest.mock('fs');
jest.mock('request');

const request = require('request');
const fs = require('fs');
const _ = require('lodash');
const Sequelize = require('sequelize');
const { DbInitializer } = require('..');

fs.readdirSync.mockImplementation(_.constant(['']));
const fileContent = 'fileContent';
fs.readFileSync.mockImplementation(_.constant(fileContent));

describe('db init', () => {
    const model = { name: 'modelName' };
    const modelFactories = [() => model];

    function mockSequelize() {
        const sequelizeMock = {
            afterDisconnect: jest.fn(),
            beforeQuery: jest.fn(),
            close: jest.fn(),
            authenticate: jest.fn()
        };
        Sequelize.mockImplementation(_.constant(sequelizeMock));
        return sequelizeMock;
    }

    function mockLogger() {
        return { getLogger: _.constant({ info: _.noop, error: _.noop, debug: jest.fn() }) };
    }

    function getOptions(url, ssl) {
        return {
            url,
            options: {
                dialectOptions: {
                    ssl
                }
            }
        };
    }

    it('should handle invalid url gracefully', () => {
        const initializer = new DbInitializer(getOptions(), mockLogger());
        return expect(initializer.init()).rejects.toEqual(
            new Error(
                'Invalid db.url parameter passed to the configuration. Expected not empty string or array of strings.'
            )
        );
    });

    it('should handle string url and connection failure', () => {
        const sequelizeMock = mockSequelize();
        sequelizeMock.authenticate = null;
        const logger = mockLogger();
        const initializer = new DbInitializer(
            getOptions('postgres://url', { cert: 'certPath', ca: 'caPath' }),
            logger,
            modelFactories
        );
        return initializer.init().then(() => {
            expect(sequelizeMock.beforeQuery).toHaveBeenCalled();
            expect(sequelizeMock.afterDisconnect).toHaveBeenCalled();
            expect(sequelizeMock.close).toHaveBeenCalled();
            expect(initializer.db[model.name]).toBe(model);
            expect(Sequelize.mock.calls[0][1]).toMatchObject({
                dialectOptions: {
                    ssl: {
                        ca: fileContent,
                        cert: fileContent,
                        key: fileContent
                    }
                }
            });

            const logMessage = 'logger test';
            Sequelize.mock.calls[0][1].logging(logMessage);
            expect(logger.getLogger().debug).toHaveBeenCalledWith(logMessage);
        });
    });

    it('should handle string url and connection success', () => {
        const sequelizeMock = mockSequelize();
        const initializer = new DbInitializer(
            getOptions('postgres://url', { ca: 'caPath' }),
            mockLogger(),
            modelFactories
        );
        return initializer.init().then(() => {
            expect(sequelizeMock.beforeQuery).toHaveBeenCalled();
            expect(sequelizeMock.afterDisconnect).toHaveBeenCalled();
            expect(sequelizeMock.close).not.toHaveBeenCalled();
        });
    });

    it('should restart after disconnection', () => {
        const sequelizeMock = mockSequelize();
        const initializer = new DbInitializer(
            getOptions('postgres://url', { ca: 'caPath' }),
            mockLogger(),
            modelFactories
        );
        return initializer
            .init()
            .then(() => {
                expect(sequelizeMock.close).not.toHaveBeenCalled();
                return sequelizeMock.afterDisconnect.mock.calls[0][0]({});
            })
            .then(() => {
                expect(sequelizeMock.close).not.toHaveBeenCalled();
                return sequelizeMock.afterDisconnect.mock.calls[0][0]({ _invalid: true });
            })
            .then(() => expect(sequelizeMock.close).toHaveBeenCalled());
    });

    it('should restart when PG is in recovery', () => {
        const sequelizeMock = mockSequelize();
        const initializer = new DbInitializer(
            getOptions('postgres://url', { ca: 'caPath' }),
            mockLogger(),
            modelFactories
        );
        return initializer
            .init()
            .then(() => {
                expect(sequelizeMock.close).not.toHaveBeenCalled();
                return sequelizeMock.beforeQuery.mock.calls[0][0]({ isRecoveryCheck: true });
            })
            .then(() => {
                expect(sequelizeMock.close).not.toHaveBeenCalled();
                sequelizeMock.query = _.noop;
                return sequelizeMock.beforeQuery.mock.calls[0][0]({});
            })
            .then(() => {
                expect(sequelizeMock.close).not.toHaveBeenCalled();
                sequelizeMock.query = _.constant({ pg_is_in_recovery: true });
                return sequelizeMock.beforeQuery.mock.calls[0][0]({});
            })
            .then(() => sequelizeMock.beforeQuery.mock.calls[0][0]({}))
            .then(() => expect(sequelizeMock.close).toHaveBeenCalledTimes(1));
    });

    it('should handle array of URLs', () => {
        const sequelizeMock = mockSequelize();
        const url = 'postgres://url';
        const initializer = new DbInitializer(getOptions([url], { ca: 'caPath' }), mockLogger(), modelFactories);
        request.mockImplementationOnce((options, handler) => handler(true));
        request.mockImplementationOnce((options, handler) => handler(false, { statusCode: 200 }));
        return initializer.init().then(() => {
            expect(request).toHaveBeenCalledTimes(2);
            expect(request.mock.calls[0][0]).toMatchObject({ url: 'https://url:8008' });
            expect(request.mock.calls[1][0]).toMatchObject({ url: 'https://url:8008' });
            expect(Sequelize.mock.calls[0][0]).toBe(url);
            expect(sequelizeMock.authenticate).toHaveBeenCalled();
            expect(sequelizeMock.close).not.toHaveBeenCalled();
        });
    });
});
