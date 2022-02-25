## Configurations

This directory contains shared configuration for development tools.


### ESLint

ESLint configs should be extended by every cloudify-ui project/module.

#### Usage

Once `cloudify-ui-common` is installed as a dependency it is required to modify project's ESLint config (most probably `.eslintrc` or `.eslintrc.json` file) by adding the following entry (assuming ESLint config file is located in top level directory and it is a React project):
```json
{
  "extends": ["./node_modules/cloudify-ui-common/configs/eslint-common-react.json"]
}
```
It is also required to install peer dependencies as specified in `package.json`.
There are few configuration files that can be extended.
The table below describes their purpose and dependencies necessary to be installed prior using each configuration file.

Note: `eslint-common.json` does not extends AirBnB ESLint configuration, so it should not be used alone in the UI projects.

| Configuration file           | Used for                  | Dependencies                                                                                                                              |
|---                           |---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `eslint-ts-overrides.json`   | TypeScript-based projects | `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`                                                                           |
| `eslint-common.json`         | a base for other configs  | `eslint`, `eslint-config-prettier`, `eslint-plugin-import`, `eslint-plugin-prettier`, `eslint-plugin-scanjs-rules`, `eslint-plugin-security` |
| `eslint-common-react.json`   | React-based projects      | all from `eslint-config-airbnb` and `eslint-common.json` and `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` |
| `eslint-common-node.json`    | Node-based projects       | all from `eslint-config-airbnb-base` and `eslint-common.json`, `eslint-plugin-node`                                                       |
| `eslint-common-cypress.json` | Cypress subprojects       | all from `eslint-config-airbnb-base` and `eslint-common.json`, `eslint-plugin-cypress`, `eslint-plugin-chai-friendly`                     |


### TypeScript

There are 2 possible base `tsconfig.json` files:

1. `tsconfig.base.json` - contains compiler options that help maintain code quality. They allow
   using JavaScript and TypeScript in the same project.

   This configuration should be used for user-facing projects that do not need to be used as
   dependencies in other projects (not libraries).

2. `tsconfig.composite.json` - extends `tsconfig.base.json` with settings necessary to allow
   generating [declaration maps](https://www.typescriptlang.org/tsconfig#declarationMap).

   This is useful for libraries, which are consumed by other user-facing projects.

To use an existing tsconfig as a base, specify the [extends](https://www.typescriptlang.org/tsconfig#extends) property in your `tsconfig.json`:

```json
{
    "extends": "./node_modules/cloudify-ui-common/configs/tsconfig.base.json"
}
```

### Prettier

Prettier config should be extended by every cloudify-ui project/module.

#### Usage

Once `cloudify-ui-common` is installed as a dependency it is required to modify project's Prettier config (you should use JS version - `.prettierrc.js` file) by requiring common configuration the following way:
```js
module.exports = require('./node_modules/cloudify-ui-common/configs/prettier-common.json');
```
