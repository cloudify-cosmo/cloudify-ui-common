// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************
import coverageTask from '@cypress/code-coverage/task';
import { startDevServer } from '@cypress/webpack-dev-server';
import type { StartDevServer } from '@cypress/webpack-dev-server';
import removeVideosForPassedTests from './removeVideosForPassedTests';
/**
 * Performs common plugin and configuration setup - registers coverage plugin and sets `baseUrl` property if MANAGER_IP
 * environment variable is set
 *
 * @param on Adds listener function to the end of the listeners array for the given event
 *           @see https://nodejs.org/api/events.html#events_emitter_on_eventname_listener
 *           @see https://docs.cypress.io/api/events/catalog-of-events.html#App-Events
 * @param config Cypress configuration object to be updated
 * @param webpackConfig Webpack configuration
 * @returns Updated configuration
 */
const setupPluginsAndConfig = (
    on: Cypress.PluginEvents,
    config: Cypress.PluginConfigOptions,
    webpackConfig: StartDevServer['webpackConfig']
): Cypress.PluginConfigOptions => {
    coverageTask(on, config);

    const { MANAGER_IP, MANAGER_PROTOCOL = 'http' } = process.env;
    if (MANAGER_IP) {
        config.baseUrl = `${MANAGER_PROTOCOL}://${MANAGER_IP}`;
    }

    console.info(`Testing on: ${config.baseUrl}`);

    if (config.testingType === 'component') {
        on('dev-server:start', options =>
            startDevServer({
                options,
                webpackConfig
            })
        );
    }

    removeVideosForPassedTests(on, config);

    return config;
};

export default setupPluginsAndConfig;
