import { defineConfig } from 'cypress';
import coverageTask from '@cypress/code-coverage/task';
import { promises as fs } from 'fs';
import ResolvedConfigOptions = Cypress.ResolvedConfigOptions;
import ConfigHandler = Cypress.ConfigHandler;
import PickConfigOpt = Cypress.PickConfigOpt;

const setRemovingVideosForPassedTestsTask = (on: Cypress.PluginEvents): void => {
    // Delete the recorded video for specs that had no retry attempts
    // https://github.com/cypress-io/cypress/issues/16377
    on('after:spec', async (_spec, results) => {
        if (results && results.video) {
            const failedTests = results.tests?.some(test => test.attempts.some(attempt => attempt?.state === 'failed'));
            if (!failedTests && results.video) {
                await fs.unlink(results.video);
            }
        }
    });
};

/**
 * Creates common cypress configuration
 *
 * @param localBaseUrl
 * @param webpackConfig
 */
export function getConfig(localBaseUrl: string, webpackConfig?: ConfigHandler<PickConfigOpt<'webpackConfig'>>) {
    const { MANAGER_IP, MANAGER_PROTOCOL = 'http' } = process.env;
    const baseUrl = MANAGER_IP ? `${MANAGER_PROTOCOL}://${MANAGER_IP}` : localBaseUrl;

    const setupNodeEvents: ResolvedConfigOptions['setupNodeEvents'] = (on, config) => {
        coverageTask(on, config);
        setRemovingVideosForPassedTestsTask(on);
    };

    return defineConfig({
        fixturesFolder: 'test/cypress/fixtures',
        screenshotsFolder: 'test/cypress/screenshots',
        videosFolder: 'test/cypress/videos',
        defaultCommandTimeout: 15000,
        video: true,
        reporter: 'junit',
        reporterOptions: {
            mochaFile: 'test/cypress/results/test-results-[hash].xml',
            testCaseSwitchClassnameAndName: true
        },
        videoUploadOnPasses: false,
        watchForFileChanges: false,
        nodeVersion: 'system',
        e2e: {
            setupNodeEvents: (on, config) => {
                setupNodeEvents(on, config);
                console.info(`Testing on: ${baseUrl}`);
            },
            specPattern: 'test/cypress/integration/**/*_spec.ts',
            supportFile: 'test/cypress/support/index.ts',
            baseUrl
        },
        component: {
            devServer: {
                framework: 'react',
                bundler: 'webpack',
                webpackConfig
            },
            setupNodeEvents,
            viewportWidth: 850,
            viewportHeight: 800,
            specPattern: 'test/cypress/components/**/*_spec.tsx',
            supportFile: 'test/cypress/support/index.ts',
            indexHtmlFile: 'test/cypress/support/component-index.html'
        }
    });
}
