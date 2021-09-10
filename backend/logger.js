const winston = require('winston');
const _ = require('lodash');
const fs = require('fs');
const events = require('events');

function getArgsSupportedLogger(logger) {
    // This is workaround for no support for multi-arguments logging, e.g.: logger.info('Part 1', 'Part 2')
    // See: https://github.com/winstonjs/winston/issues/1614
    const wrapper = original => {
        return (...args) => {
            for (let index = 0; index < args.length; index += 1) {
                if (args[index] instanceof Error) {
                    args[index] = args[index].stack;
                } else if (!_.isString(args[index])) {
                    try {
                        const stringifiedObject = JSON.stringify(args[index]);
                        args[index] = stringifiedObject;
                    } catch (error) {
                        args[index] = '<NotParsable>';
                    }
                }
            }
            original(args.join(' '));
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

/**
 * Initializes logging framework according to the given config
 *
 * @param {Object} config configuration object
 * @param {string} config.logLevelConf path to manager's logging.conf file
 * @param {string} config.logLevel default log level to be used when `logLevelConf` is not set, file defined by
 * `logLevelConf` does not exist, or the file exists but contains no entry for the given `serviceName`
 * @param {string} config.logsFile path to main log file
 * @param {string} config.errorsFile path to errors log file
 * @param {string} config.serviceName service name to look for in file specified by `logLevelConf
 * @param {number} defaultMaxListeners optional number of default event listeners to be assigned to
 * EventEmitter.defaultMaxListeners, should be set to at least the number of logging categories to be used, defaults to 30
 * @returns {Object} object containing `getLogger` and `logErrorsOnly` functions
 */
function initLogging(config, defaultMaxListeners = 30) {
    events.EventEmitter.defaultMaxListeners = defaultMaxListeners;

    /*
     * Reads log level from manager's configuration file, as specified by `logLevelConf` configuration parameter.
     * See https://github.com/cloudify-cosmo/cloudify-manager/blob/master/packaging/mgmtworker/files/etc/cloudify/logging.conf
     */
    function getLevelFromLoggingConf() {
        try {
            return _.chain(fs.readFileSync(config.logLevelConf))
                .split('\n')
                .map(_.trim)
                .filter(fileEntry => !fileEntry.startsWith('#'))
                .map(fileEntry => fileEntry.split(/\s+/))
                .find(fileEntryWords => _.last(fileEntryWords) === config.serviceName)
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
        ({ level, message, label, timestamp }) => `[${timestamp}][${label}] ${_.upperCase(level)}: ${message}`
    );

    const level = (config.logLevelConf && getLevelFromLoggingConf()) || config.logLevel;

    /**
     * Returns logger for given category
     *
     * @param {string} category category
     * @returns {Object} winston logger instance
     */
    function getLogger(category) {
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

module.exports = initLogging;
