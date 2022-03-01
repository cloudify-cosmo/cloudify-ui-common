import winston from 'winston';
import { chain, isString, last, trim, upperCase } from 'lodash';
import { readFileSync } from 'fs';
import events from 'events';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LoggerArgs = any[];
export type Logger = winston.Logger &
    Record<'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly' | 'log', (...args: LoggerArgs) => winston.Logger>;
export type LoggerFactory = { getLogger: (category: string) => Logger; logErrorsOnly: () => void };

function getArgsSupportedLogger(logger: winston.Logger): Logger {
    // This is workaround for no support for multi-arguments logging, e.g.: logger.info('Part 1', 'Part 2')
    // See: https://github.com/winstonjs/winston/issues/1614
    const wrapper = (original: winston.LeveledLogMethod) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (...args: LoggerArgs) => {
            for (let index = 0; index < args.length; index += 1) {
                if (args[index] instanceof Error) {
                    args[index] = args[index].stack;
                } else if (!isString(args[index])) {
                    try {
                        const stringifiedObject = JSON.stringify(args[index]);
                        args[index] = stringifiedObject;
                    } catch (error) {
                        args[index] = '<NotParsable>';
                    }
                }
            }
            return original(args.join(' '));
        };
    };

    logger.error = wrapper(logger.error);
    logger.warn = wrapper(logger.warn);
    logger.info = wrapper(logger.info);
    logger.verbose = wrapper(logger.verbose);
    logger.debug = wrapper(logger.debug);
    logger.silly = wrapper(logger.silly);
    logger.log = logger.info;

    return logger;
}

type LoggerConfig = {
    /**
     * path to manager's logging.conf file
     */
    logLevelConf?: string;

    /**
     * default log level to be used when `logLevelConf` is not set, file defined by
     * `logLevelConf` does not exist, or the file exists but contains no entry for the given `serviceName`
     */
    logLevel?: string;

    /**
     * path to main log file
     */
    logsFile?: string;

    /**
     * path to errors log file
     */
    errorsFile?: string;

    /**
     * service name to look for in file specified by `logLevelConf`
     */
    serviceName?: string;
};
/**
 * Initializes logging framework according to the given config
 *
 * @param {LoggerConfig} config configuration object
 * @param {number} defaultMaxListeners optional number of default event listeners to be assigned to
 * EventEmitter.defaultMaxListeners, should be set to at least the number of logging categories to be used, defaults to 30
 *
 * @returns {LoggerFactory} object containing `getLogger` and `logErrorsOnly` functions
 */
function initLogging(config: LoggerConfig, defaultMaxListeners = 30): LoggerFactory {
    events.EventEmitter.defaultMaxListeners = defaultMaxListeners;

    /*
     * Reads log level from manager's configuration file, as specified by `logLevelConf` configuration parameter.
     * See https://github.com/cloudify-cosmo/cloudify-manager/blob/master/packaging/mgmtworker/files/etc/cloudify/logging.conf
     */
    function getLevelFromLoggingConf() {
        try {
            return chain(readFileSync(config.logLevelConf as string))
                .split('\n')
                .map(trim)
                .filter(fileEntry => !fileEntry.startsWith('#'))
                .map(fileEntry => fileEntry.split(/\s+/))
                .find(fileEntryWords => last(fileEntryWords) === config.serviceName)
                .first()
                .toLower()
                .thru(l => (l === 'warning' ? 'warn' : l))
                .value();
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn(`Couldn't read logging level from ${config.logLevelConf}:`, e);
            return null;
        }
    }

    const transports = [
        new winston.transports.Console({
            format: winston.format.colorize({ all: true })
        }),
        new winston.transports.File({ filename: config.logsFile }),
        new winston.transports.File({ filename: config.errorsFile, level: 'error' })
    ];

    const logFormat = winston.format.printf(
        ({ level, message, label, timestamp }) => `[${timestamp}][${label}] ${upperCase(level)}: ${message}`
    );

    const level = (config.logLevelConf && getLevelFromLoggingConf()) || config.logLevel;

    /**
     * Returns logger for given category
     *
     * @param {string} category category
     *
     * @returns {Logger} enhanced winston logger instance
     */
    function getLogger(category: string): Logger {
        if (winston.loggers.has(category)) {
            return winston.loggers.get(category);
        }

        const logger = winston.loggers.add(category, {
            level,
            transports,
            format: winston.format.combine(
                winston.format.label({ label: category }),
                winston.format.timestamp(),
                logFormat
            )
        });

        return getArgsSupportedLogger(logger);
    }

    /**
     * Sets threshold log level to `error`
     */
    function logErrorsOnly() {
        transports.forEach(transport => {
            transport.level = 'error';
        });
    }

    return {
        getLogger,
        logErrorsOnly
    };
}

export default initLogging;
