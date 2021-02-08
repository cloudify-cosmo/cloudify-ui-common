module.exports = {
    collectCoverageFrom: ['./src/**/*.{js,ts}', 'backend/*.{js,ts}'],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        }
    }
};
