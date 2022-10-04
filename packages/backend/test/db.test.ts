import axios from 'axios';
import fs from 'fs';
import _ from 'lodash';
import Sequelize from 'sequelize';
import type { ModelStatic } from 'sequelize';
import getDbModule from '../src/db';
import type { DbConfig, DialectOptions } from '../src/db';
import type { LoggerFactory } from '../src/logger';
import toMock from './toMock';

jest.mock('sequelize');
jest.mock('fs');
jest.mock('axios');

const fileContent = 'fileContent';
(<jest.Mock>fs.readFileSync).mockImplementation(_.constant(fileContent));

describe('db init', () => {
    const model = { name: 'modelName' } as ModelStatic<never>;

    function mockSequelize() {
        const sequelizeMock = {
            afterDisconnect: jest.fn(),
            beforeQuery: jest.fn(),
            close: jest.fn(),
            authenticate: jest.fn(),
            query: jest.fn()
        };
        toMock(Sequelize).mockImplementation(_.constant(sequelizeMock));
        return sequelizeMock;
    }

    function mockLogger() {
        return {
            getLogger: _.constant({ info: _.noop, error: _.noop, debug: jest.fn() }),
            logErrorsOnly: _.noop
        };
    }

    function getOptions(url: string | string[] = '', ssl: DialectOptions['ssl'] = { ca: 'ca' }): DbConfig {
        return {
            url,
            options: {
                dialectOptions: {
                    ssl
                }
            }
        };
    }

    function getDbModuleWithMockedLogger(dbConfig: DbConfig, mockedLogger: ReturnType<typeof mockLogger>) {
        return getDbModule(dbConfig, <LoggerFactory>(<unknown>mockedLogger), [() => model]);
    }

    it('should handle invalid url gracefully', () => {
        const dbModule = getDbModuleWithMockedLogger(getOptions(), mockLogger());
        return expect(dbModule.init()).rejects.toEqual(
            new Error(
                'Invalid db.url parameter passed to the configuration. Expected not empty string or array of strings.'
            )
        );
    });

    it('should handle string url and connection failure', () => {
        const sequelizeMock = mockSequelize();
        sequelizeMock.authenticate.mockImplementation(async () => Promise.reject(new Error('Cannot connect')));
        const logger = mockLogger();
        const dbModule = getDbModuleWithMockedLogger(
            getOptions('postgres://url', { ca: 'caPath', cert: 'certPath', key: 'keyPath' }),
            logger
        );
        return dbModule.init().then(() => {
            expect(sequelizeMock.beforeQuery).toHaveBeenCalled();
            expect(sequelizeMock.afterDisconnect).toHaveBeenCalled();
            expect(sequelizeMock.close).toHaveBeenCalled();
            expect(dbModule.db[model.name]).toBe(model);
            expect(toMock(Sequelize).mock.calls[0][1]).toMatchObject({
                dialectOptions: {
                    ssl: {
                        ca: fileContent,
                        cert: fileContent,
                        key: fileContent
                    }
                }
            });

            const logMessage = 'logger test';
            toMock(Sequelize).mock.calls[0][1].logging(logMessage);
            expect(logger.getLogger().debug).toHaveBeenCalledWith(logMessage);
        });
    });

    it('should handle string url and connection success', () => {
        const sequelizeMock = mockSequelize();
        const dbModule = getDbModuleWithMockedLogger(getOptions('postgres://url'), mockLogger());
        return dbModule.init().then(() => {
            expect(sequelizeMock.beforeQuery).toHaveBeenCalled();
            expect(sequelizeMock.afterDisconnect).toHaveBeenCalled();
            expect(sequelizeMock.close).not.toHaveBeenCalled();
        });
    });

    it('should restart after disconnection', () => {
        const sequelizeMock = mockSequelize();
        const dbModule = getDbModuleWithMockedLogger(getOptions('postgres://url'), mockLogger());
        return dbModule
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
        const dbModule = getDbModuleWithMockedLogger(getOptions('postgres://url'), mockLogger());
        return dbModule
            .init()
            .then(() => {
                expect(sequelizeMock.close).not.toHaveBeenCalled();
                return sequelizeMock.beforeQuery.mock.calls[0][0]({ isRecoveryCheck: true });
            })
            .then(() => {
                expect(sequelizeMock.close).not.toHaveBeenCalled();
                sequelizeMock.query.mockImplementation(_.noop);
                return sequelizeMock.beforeQuery.mock.calls[0][0]({});
            })
            .then(() => {
                expect(sequelizeMock.close).not.toHaveBeenCalled();
                sequelizeMock.query.mockReturnValue({ pg_is_in_recovery: true });
                return sequelizeMock.beforeQuery.mock.calls[0][0]({});
            })
            .then(() => sequelizeMock.beforeQuery.mock.calls[0][0]({}))
            .then(() => expect(sequelizeMock.close).toHaveBeenCalledTimes(1));
    });

    it('should handle array of URLs', () => {
        const sequelizeMock = mockSequelize();
        const url = 'postgres://url';
        const dbModule = getDbModuleWithMockedLogger(getOptions([url]), mockLogger());
        const expectedAxiosConfig = expect.objectContaining({
            httpsAgent: expect.objectContaining({
                options: expect.objectContaining({
                    ca: expect.stringMatching('fileContent')
                })
            })
        });
        const expectedSequelizeOptions = expect.objectContaining({
            dialectOptions: { ssl: { ca: 'fileContent' } },
            logging: expect.any(Function)
        });

        toMock(axios).mockRejectedValueOnce('');
        toMock(axios).mockResolvedValueOnce({ status: 200 });
        return dbModule.init().then(() => {
            expect(axios).toHaveBeenCalledTimes(2);
            expect(axios).toHaveBeenNthCalledWith(1, 'https://url:8008', expectedAxiosConfig);
            expect(axios).toHaveBeenNthCalledWith(2, 'https://url:8008', expectedAxiosConfig);
            expect(Sequelize).toHaveBeenCalledWith(url, expectedSequelizeOptions);
            expect(sequelizeMock.authenticate).toHaveBeenCalled();
            expect(sequelizeMock.close).not.toHaveBeenCalled();
        });
    });
});
