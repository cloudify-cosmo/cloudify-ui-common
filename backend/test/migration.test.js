/* eslint-disable no-console */
jest.mock('umzug');

const _ = require('lodash');
const umzug = require('umzug');
const { runMigration } = require('..');

describe('migration', () => {
    function mockUmzug(executedMigrations = [], pendingMigrations = []) {
        function toMigrations(migrationFileNames) {
            return migrationFileNames.map(migrationFile => ({ file: migrationFile }));
        }
        const umzugInstance = {
            on: _.noop,
            executed: jest.fn(() => Promise.resolve(toMigrations(executedMigrations))),
            pending: jest.fn(() => Promise.resolve(toMigrations(pendingMigrations))),
            down: jest.fn(_.constant(Promise.resolve())),
            up: jest.fn(_.constant(Promise.resolve()))
        };
        umzug.mockImplementation(() => umzugInstance);
        return umzugInstance;
    }

    function mockLogger() {
        const logger = { info: jest.fn(), error: _.noop };
        return {
            logErrorsOnly: jest.fn(),
            getLogger: _.constant(logger)
        };
    }

    const tableName = 'tableName';

    function mockDb() {
        return {
            init: _.constant(Promise.resolve()),
            db: {
                sequelize: {
                    getQueryInterface: _.constant({
                        showAllTables: _.constant(Promise.resolve([tableName, 'SequelizeMeta']))
                    }),
                    query: jest.fn()
                }
            }
        };
    }

    function setArgs(...args) {
        process.argv = [null, null, ...args];
    }

    it('should execute `current` command', () => {
        mockUmzug();
        const logger = mockLogger();
        console.log = jest.fn();
        setArgs('current');
        return new Promise(done => {
            process.exit = () => {
                expect(logger.logErrorsOnly).toHaveBeenCalled();
                expect(umzug).toHaveBeenCalled();
                expect(umzug.mock.calls[0][0].migrations.params[3]).toThrowError();

                const logMessage = 'umzug logger test';
                umzug.mock.calls[0][0].logging(logMessage);
                expect(logger.getLogger().info).toHaveBeenCalledWith([logMessage]);

                expect(console.log).toHaveBeenCalledWith('<NO_MIGRATIONS>');

                done();
            };

            runMigration(logger, mockDb());
        });
    });

    it('should execute `status` command', () => {
        const umzugInstance = mockUmzug();
        const logger = mockLogger();
        setArgs('status');
        return new Promise(done => {
            process.exit = returnCode => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(umzugInstance.pending).toHaveBeenCalledTimes(1);
                expect(umzugInstance.executed).toHaveBeenCalledTimes(1);
                expect(returnCode).toBe(0);
                expect(logger.getLogger().info).toHaveBeenCalledWith(
                    '{\n  "current": "<NO_MIGRATIONS>",\n  "executed": [],\n  "pending": []\n}'
                );
                done();
            };
            runMigration(logger, mockDb());
        });
    });

    it('should execute `up` command', () => {
        const umzugInstance = mockUmzug(['dummy']);
        const logger = mockLogger();
        setArgs('up');
        return new Promise(done => {
            process.exit = () => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(umzugInstance.up).toHaveBeenCalled();
                expect(umzugInstance.pending).toHaveBeenCalled();
                expect(umzugInstance.executed).toHaveBeenCalled();
                done();
            };
            runMigration(logger, mockDb());
        });
    });

    it('should execute `reset` command', () => {
        const umzugInstance = mockUmzug(['dummy']);
        const logger = mockLogger();
        setArgs('reset');
        return new Promise(done => {
            process.exit = () => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(umzugInstance.down).toHaveBeenCalled();
                expect(umzugInstance.pending).toHaveBeenCalled();
                expect(umzugInstance.executed).toHaveBeenCalled();
                done();
            };
            runMigration(logger, mockDb());
        });
    });

    it('should execute `clear` command', () => {
        const umzugInstance = mockUmzug(['dummy'], ['dummy']);
        const logger = mockLogger();
        const db = mockDb();
        setArgs('clear');
        return new Promise(done => {
            process.exit = () => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(umzugInstance.pending).toHaveBeenCalled();
                expect(umzugInstance.executed).toHaveBeenCalled();
                expect(db.db.sequelize.query).toHaveBeenCalledTimes(1);
                expect(db.db.sequelize.query).toHaveBeenCalledWith(`truncate "${tableName}"`);
                done();
            };
            runMigration(logger, db);
        });
    });

    it('should handle invalid command', () => {
        const umzugInstance = mockUmzug();
        const logger = mockLogger();
        setArgs('invalid');
        return new Promise(done => {
            process.exit = returnCode => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(umzugInstance.pending).not.toHaveBeenCalled();
                expect(umzugInstance.executed).not.toHaveBeenCalled();
                expect(returnCode).toBe(1);
                done();
            };
            runMigration(logger, mockDb());
        });
    });

    it('should handle missing command', () => {
        const umzugInstance = mockUmzug();
        const logger = mockLogger();
        setArgs();
        return new Promise(done => {
            process.exit = returnCode => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(umzugInstance.pending).not.toHaveBeenCalled();
                expect(umzugInstance.executed).not.toHaveBeenCalled();
                expect(returnCode).toBe(1);
                done();
            };
            runMigration(logger, mockDb());
        });
    });

    it('should execute `downTo` command when already at initial state', () => {
        mockUmzug([], ['dummy']);
        const logger = mockLogger();
        setArgs('downTo', 'initial');
        return new Promise(done => {
            process.exit = returnCode => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(returnCode).toBe(1);
                done();
            };
            runMigration(logger, mockDb());
        });
    });

    it('should execute `downTo` command and handle missing migration name', () => {
        mockUmzug();
        const logger = mockLogger();
        setArgs('downTo', '');
        return new Promise(done => {
            process.exit = returnCode => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(returnCode).toBe(1);
                done();
            };
            runMigration(logger, mockDb());
        });
    });

    it('should execute `downTo` command and handle invalid migration name', () => {
        mockUmzug(['valid'], ['dummy']);
        const logger = mockLogger();
        setArgs('downTo', 'invalid');
        return new Promise(done => {
            process.exit = returnCode => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(returnCode).toBe(1);
                done();
            };
            runMigration(logger, mockDb());
        });
    });

    it('should execute `downTo` command when given migration is the last one executed', () => {
        const umzugInstance = mockUmzug(['valid'], ['dummy']);
        const logger = mockLogger();
        setArgs('downTo', 'valid');
        return new Promise(done => {
            process.exit = returnCode => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(umzugInstance.down).not.toHaveBeenCalled();
                expect(returnCode).toBe(0);
                done();
            };
            runMigration(logger, mockDb());
        });
    });

    it('should execute `downTo` command succesfully', () => {
        const umzugInstance = mockUmzug(['valid', 'last'], ['dummy']);
        const logger = mockLogger();
        setArgs('downTo', 'valid');
        return new Promise(done => {
            process.exit = returnCode => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(umzugInstance.down).toHaveBeenCalled();
                expect(returnCode).toBe(0);
                done();
            };
            runMigration(logger, mockDb());
        });
    });
});
