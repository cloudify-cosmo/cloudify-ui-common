import _ from 'lodash';
import { Umzug } from 'umzug';
import runMigration from '../migration';
import type { LoggerFactory } from '../logger';
import type { DbModule } from '../db';

jest.mock('umzug');

describe('migration', () => {
    function mockUmzug(executedMigrationsNames: string[] = [], pendingMigrationsNames: string[] = []) {
        function toMigrations(migrationsNames: string[]) {
            return migrationsNames.map(migrationName => ({ name: migrationName }));
        }
        const umzugInstance = {
            on: _.noop,
            executed: jest.fn(() => Promise.resolve(toMigrations(executedMigrationsNames))),
            pending: jest.fn(() => Promise.resolve(toMigrations(pendingMigrationsNames))),
            down: jest.fn(_.constant(Promise.resolve())),
            up: jest.fn(_.constant(Promise.resolve()))
        };
        (<jest.Mock>(<unknown>Umzug)).mockImplementation(() => umzugInstance);
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

    function mockProcessExit(mockImplementation: (code?: number | undefined) => void) {
        process.exit = mockImplementation as never;
    }

    function setArgs(...args: string[]) {
        process.argv = ['', '', ...args];
    }

    function testMigration(logger: ReturnType<typeof mockLogger>, db: ReturnType<typeof mockDb>) {
        runMigration(<LoggerFactory>(<unknown>logger), <DbModule>(<unknown>db));
    }

    it('should execute `current` command', () => {
        mockUmzug();
        const logger = mockLogger();
        console.log = jest.fn();
        setArgs('current');
        return new Promise<void>(done => {
            mockProcessExit(() => {
                expect(logger.logErrorsOnly).toHaveBeenCalled();
                expect(Umzug).toHaveBeenCalled();

                expect(console.log).toHaveBeenCalledWith('<NO_MIGRATIONS>');

                done();
            });

            testMigration(logger, mockDb());
        });
    });

    it('should execute `status` command', () => {
        const umzugInstance = mockUmzug();
        const logger = mockLogger();
        setArgs('status');
        return new Promise<void>(done => {
            mockProcessExit(returnCode => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(umzugInstance.pending).toHaveBeenCalledTimes(1);
                expect(umzugInstance.executed).toHaveBeenCalledTimes(1);
                expect(returnCode).toBe(0);
                expect(logger.getLogger().info).toHaveBeenCalledWith(
                    '{\n  "current": "<NO_MIGRATIONS>",\n  "executed": [],\n  "pending": []\n}'
                );
                done();
            });
            testMigration(logger, mockDb());
        });
    });

    it('should execute `up` command', () => {
        const umzugInstance = mockUmzug(['dummy']);
        const logger = mockLogger();
        setArgs('up');
        return new Promise<void>(done => {
            mockProcessExit(() => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(umzugInstance.up).toHaveBeenCalled();
                expect(umzugInstance.pending).toHaveBeenCalled();
                expect(umzugInstance.executed).toHaveBeenCalled();
                done();
            });
            testMigration(logger, mockDb());
        });
    });

    it('should execute `reset` command', () => {
        const umzugInstance = mockUmzug(['dummy']);
        const logger = mockLogger();
        setArgs('reset');
        return new Promise<void>(done => {
            mockProcessExit(() => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(umzugInstance.down).toHaveBeenCalled();
                expect(umzugInstance.pending).toHaveBeenCalled();
                expect(umzugInstance.executed).toHaveBeenCalled();
                done();
            });
            testMigration(logger, mockDb());
        });
    });

    it('should execute `clear` command', () => {
        const umzugInstance = mockUmzug(['dummy'], ['dummy']);
        const logger = mockLogger();
        const db = mockDb();
        setArgs('clear');
        return new Promise<void>(done => {
            mockProcessExit(() => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(umzugInstance.pending).toHaveBeenCalled();
                expect(umzugInstance.executed).toHaveBeenCalled();
                expect(db.db.sequelize.query).toHaveBeenCalledTimes(1);
                expect(db.db.sequelize.query).toHaveBeenCalledWith(`truncate "${tableName}"`);
                done();
            });
            testMigration(logger, db);
        });
    });

    it('should handle invalid command', () => {
        const umzugInstance = mockUmzug();
        const logger = mockLogger();
        setArgs('invalid');
        return new Promise<void>(done => {
            mockProcessExit(returnCode => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(umzugInstance.pending).not.toHaveBeenCalled();
                expect(umzugInstance.executed).not.toHaveBeenCalled();
                expect(returnCode).toBe(1);
                done();
            });
            testMigration(logger, mockDb());
        });
    });

    it('should handle missing command', () => {
        const umzugInstance = mockUmzug();
        const logger = mockLogger();
        setArgs();
        return new Promise<void>(done => {
            mockProcessExit(returnCode => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(umzugInstance.pending).not.toHaveBeenCalled();
                expect(umzugInstance.executed).not.toHaveBeenCalled();
                expect(returnCode).toBe(1);
                done();
            });
            testMigration(logger, mockDb());
        });
    });

    it('should execute `downTo` command when already at initial state', () => {
        mockUmzug([], ['dummy']);
        const logger = mockLogger();
        setArgs('downTo', 'initial');
        return new Promise<void>(done => {
            mockProcessExit(returnCode => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(returnCode).toBe(1);
                done();
            });
            testMigration(logger, mockDb());
        });
    });

    it('should execute `downTo` command and handle missing migration name', () => {
        mockUmzug();
        const logger = mockLogger();
        setArgs('downTo', '');
        return new Promise<void>(done => {
            mockProcessExit(returnCode => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(returnCode).toBe(1);
                done();
            });
            testMigration(logger, mockDb());
        });
    });

    it('should execute `downTo` command and handle invalid migration name', () => {
        mockUmzug(['valid'], ['dummy']);
        const logger = mockLogger();
        setArgs('downTo', 'invalid');
        return new Promise<void>(done => {
            mockProcessExit(returnCode => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(returnCode).toBe(1);
                done();
            });
            testMigration(logger, mockDb());
        });
    });

    it('should execute `downTo` command when given migration is the last one executed', () => {
        const umzugInstance = mockUmzug(['valid'], ['dummy']);
        const logger = mockLogger();
        setArgs('downTo', 'valid');
        return new Promise<void>(done => {
            mockProcessExit(returnCode => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(umzugInstance.down).not.toHaveBeenCalled();
                expect(returnCode).toBe(0);
                done();
            });
            testMigration(logger, mockDb());
        });
    });

    it('should execute `downTo` command succesfully', () => {
        const umzugInstance = mockUmzug(['valid', 'last'], ['dummy']);
        const logger = mockLogger();
        setArgs('downTo', 'valid');
        return new Promise<void>(done => {
            mockProcessExit(returnCode => {
                expect(logger.logErrorsOnly).not.toHaveBeenCalled();
                expect(umzugInstance.down).toHaveBeenCalled();
                expect(returnCode).toBe(0);
                done();
            });
            testMigration(logger, mockDb());
        });
    });
});
