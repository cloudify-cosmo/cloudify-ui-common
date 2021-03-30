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

/**
 * Performs common plugin and configuration setup - registers coverage plugin and sets `baseUrl` property if MANAGER_IP
 * environment variable is set
 *
 * @param on Adds listener function to the end of the listeners array for the given event
 *           @see https://nodejs.org/api/events.html#events_emitter_on_eventname_listener
 *           @see https://docs.cypress.io/api/events/catalog-of-events.html#App-Events
 * @param config Cypress configuration object to be updated
 * @returns Updated configuration
 */
const setupPluginsAndConfig: Cypress.PluginConfig = (on, config) => {
    coverageTask(on, config);

    const { MANAGER_IP, MANAGER_PROTOCOL } = process.env;
    if (MANAGER_IP) {
        config.baseUrl = `${MANAGER_PROTOCOL ?? 'http'}://${MANAGER_IP}`;
    }

    console.info(`Testing on: ${config.baseUrl}`);

    return config;
};

export default setupPluginsAndConfig;
