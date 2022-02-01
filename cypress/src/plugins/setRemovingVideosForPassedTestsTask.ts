import del from 'del';

const setRemovingVideosForPassedTestsTask = (on: Cypress.PluginEvents): void => {
    // Delete the recorded video for specs that had no retry attempts
    // https://github.com/cypress-io/cypress/issues/16377
    on('after:spec', async (_spec, results) => {
        if (results && results.video) {
            const failedTests = results.tests?.some(test => test.attempts.some(attempt => attempt?.state === 'failed'));
            if (!failedTests) {
                await del(results.video);
            }
        }
    });
};

export default setRemovingVideosForPassedTestsTask;
