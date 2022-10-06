import fs from 'fs';
import tmp from 'tmp';
import initLogging from '../src/logger';

jest.mock('fs', () => ({ ...jest.requireActual('fs'), readFileSync: jest.fn() }));

const tmpFile = tmp.tmpNameSync();

const commonConfig = Object.freeze({
    logsFile: tmpFile,
    errorsFile: tmpFile
});

describe('logger', () => {
    function mockConsoleLog() {
        global.console = <typeof console>(<unknown>{ log: jest.fn() });
    }

    it('should read log level configuration from logging.conf', () => {
        (<jest.Mock>fs.readFileSync).mockReturnValue(`silly cloudify-composer`);
        const logger = initLogging({
            logLevelConf: 'dummy_but_not_empty',
            serviceName: 'cloudify-composer',
            ...commonConfig
        }).getLogger('silly');
        expect(logger.level).toBe('silly');
    });

    it('should read log level configuration from logging.conf and handle `warning` level', () => {
        (<jest.Mock>fs.readFileSync).mockReturnValue(`warning cloudify-composer`);
        const logger = initLogging({
            logLevelConf: 'dummy_but_not_empty',
            serviceName: 'cloudify-composer',
            ...commonConfig
        }).getLogger('warning');
        expect(logger.level).toBe('warn');
    });

    it('should use default level when logLevelConf is not specified', () => {
        const logLevel = 'silly';
        const logger = initLogging({ logLevel, ...commonConfig }).getLogger('dummy');
        expect(logger.level).toBe(logLevel);
    });

    it("should use default level when logging.conf can't be read", () => {
        (<jest.Mock>fs.readFileSync).mockImplementation(() => {
            throw Error();
        });
        const logLevel = 'silly';
        const logger = initLogging({ logLevelConf: 'dummy_but_not_empty', logLevel, ...commonConfig }).getLogger(
            'dummy'
        );
        expect(logger.level).toBe(logLevel);
    });

    it('should set level threshold to error', () => {
        const logger = initLogging(commonConfig);
        const errorsOnlyLogger1 = logger.getLogger('errors1');
        logger.logErrorsOnly();
        const errorsOnlyLogger2 = logger.getLogger('errors2');

        expect(errorsOnlyLogger1.transports[0].level).toBe('error');
        expect(errorsOnlyLogger2.transports[0].level).toBe('error');
    });

    it('should handle multiple log arguments', () => {
        const logger = initLogging(commonConfig).getLogger('multiple');
        mockConsoleLog();
        const arg1 = 'firstArg';
        const arg2 = Error();
        arg2.stack = 'secondArgStack';
        logger.info(arg1, arg2);
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining(`${arg1} ${arg2.stack}`));
    });

    it('should handle plain objects and array arguments', () => {
        const logger = initLogging(commonConfig).getLogger('objects');
        mockConsoleLog();

        logger.info({});
        expect(console.log).toHaveBeenLastCalledWith(expect.stringContaining('{}'));

        logger.info({ a: 'b' });
        expect(console.log).toHaveBeenLastCalledWith(expect.stringContaining('{"a":"b"}'));

        logger.info([1, 'a', { b: 'c' }, true]);
        expect(console.log).toHaveBeenLastCalledWith(expect.stringContaining('[1,"a",{"b":"c"},true]'));

        logger.info(new Set());
        expect(console.log).toHaveBeenLastCalledWith(expect.stringContaining('{}'));
    });

    it('should handle primitive arguments', () => {
        const logger = initLogging(commonConfig).getLogger('parsability');
        mockConsoleLog();

        logger.info(1.45, true, 'test', null, undefined);
        expect(console.log).toHaveBeenLastCalledWith(expect.stringContaining('1.45 true test null '));
    });

    it('should handle arguments not parsable to string', () => {
        const logger = initLogging(commonConfig).getLogger('parsability');
        mockConsoleLog();

        const circularObject: { ref: unknown } = { ref: undefined };
        circularObject.ref = circularObject;
        logger.info(circularObject);
        expect(console.log).toHaveBeenLastCalledWith(expect.stringContaining('<NotParsable>'));

        const bigInt = BigInt(123);
        logger.info(bigInt);
        expect(console.log).toHaveBeenLastCalledWith(expect.stringContaining('<NotParsable>'));
    });

    it('should have consistent instances when obtained multiple times', () => {
        const loggerFactory = initLogging(commonConfig);
        const loggingFunction = loggerFactory.getLogger('sample').info;
        const loggingFunctionSameLoggerDifferentGet = loggerFactory.getLogger('sample').info;

        expect(loggingFunction).toBe(loggingFunctionSameLoggerDifferentGet);
    });
});
