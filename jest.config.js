module.exports = {
    collectCoverageFrom: ['./src/**', 'backend/*.js'],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        }
    }
};
