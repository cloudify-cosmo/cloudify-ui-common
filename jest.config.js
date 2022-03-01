module.exports = {
    collectCoverageFrom: ['./src/*.ts', 'backend/*.ts'],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        }
    }
};
