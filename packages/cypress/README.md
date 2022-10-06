# Cloudify UI Common Cypress

[![npm](https://img.shields.io/npm/v/cloudify-ui-common-cypress.svg?style=flat)](https://www.npmjs.com/package/cloudify-ui-common-cypress)

This package contains resources common to [Cypress](https://cypress.io/) tests:

* Cypress plugins setup and runtime configuration logic - see [`plugins` directory](./src/plugins)
* Cypress custom commands definitions - see [`support` directory](./src/support)
* Cypress runner static configuration - see [`cypress.json` file](./cypress.json)


## Installation

```npm
npm install cloudify-ui-common-cypress
```

## Usage

### Plugins

Cypress plugin and configuration setup can be done the following way:

```typescript
// test/cypress/plugins/index.ts
import performCommonSetup from 'cloudify-ui-common-cypress/plugins';
import getWebpackConfig from '../../../webpack.config';

const setupPluginsAndConfig: Cypress.PluginConfig = (on, config) => {
    config.baseUrl = 'http://localhost:9000';
    return performCommonSetup(on, config, getWebpackConfig({}));
};
export default setupPluginsAndConfig;
```

### Support

Cypress custom commands can be added the following way:

```typescript
// test/cypress/support/index.ts
import './my-commands';

// test/cypress/support/my-commands.ts
import type { GetCypressChainableFromCommands } from 'cloudify-ui-common-cypress/support';
import { addCommands } from 'cloudify-ui-common-cypress/support';

declare global {
    namespace Cypress {
        export interface Chainable extends GetCypressChainableFromCommands<typeof commands> {}
    }
}
const commands = {
    myCommand: () => cy.log('This is my command')
};
addCommands(commands);
```

With that, you should be able to access Cypress custom command through `cy` global in your Cypress test code.

### Configuration

Cypress runner static configuration - `cypress.json` file - can be used the following way:

```npm
cypress run -C node_modules/cloudify-ui-common-cypress/cypress.json
```
