jest.mock('fs', () => ({ ...jest.requireActual('fs'), readFileSync: jest.fn() }));

const fs = require('fs');
const tmp = require('tmp');
const { initLogging } = require('..');

const tmpFile = tmp.tmpNameSync();

const commonConfig = Object.freeze({
    logsFile: tmpFile,
    errorsFile: tmpFile
});

describe('logger', () => {
    it('should read log level configuration from logging.conf', () => {
        fs.readFileSync.mockReturnValue(`silly cloudify-composer`);
        const logger = initLogging({
            logLevelConf: 'dummy_but_not_empty',
            serviceName: 'cloudify-composer',
            ...commonConfig
        }).getLogger('silly');
        expect(logger.level).toBe('silly');
    });

    it('should read log level configuration from logging.conf and handle `warning` level', () => {
        fs.readFileSync.mockReturnValue(`warning cloudify-composer`);
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
        fs.readFileSync.mockImplementation(() => {
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
        global.console = { log: jest.fn() };
        const arg1 = 'firstArg';
        const arg2 = Error();
        arg2.stack = 'secondArgStack';
        logger.info(arg1, arg2);
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith(expect.stringMatching(`${arg1} ${arg2.stack}`));
    });

    it('should handle plain objects and array arguments', () => {
        const logger = initLogging(commonConfig).getLogger('objects');
        global.console = { log: jest.fn() };

        /* eslint-disable no-console */
        logger.info({});
        expect(console.log).toHaveBeenLastCalledWith(expect.stringMatching('{}'));

        logger.info({ a: 'b' });
        expect(console.log).toHaveBeenLastCalledWith(expect.stringMatching('{"a":"b"}'));

        logger.info([1, 'a', { b: 'c' }, true]);
        expect(console.log).toHaveBeenLastCalledWith(expect.stringMatching('[1,"a",{"a":"b"},true]'));

        logger.info(new Set());
        expect(console.log).toHaveBeenLastCalledWith(expect.stringMatching('[object Set]'));
        /* eslint-enable no-console */
    });
});
