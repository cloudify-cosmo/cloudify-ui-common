## Configurations

This directory contains shared configuration for development tools.


### ESLint

ESLint configs should be extended by every cloudify-ui project/module.

#### Usage

Once `cloudify-ui-common` is installed as a dependency it is required to modify project's ESLint config (most probably `.eslintrc` or `.eslintrc.json` file) by adding the following entry (assuming ESLint config file is located in top level directory and it is a non-react project):
```json
{
  "extends": ["./node_modules/cloudify-ui-common/eslint/eslint-common.json"]
}
```
It is also required to install peer dependencies as specified in `package.json`.
There are three configuration files that can be extended. 
The table below describes their purpose and dependencies necessary to be installed prior using each configuration file.  

| Configuration file         | Used for                  | Dependencies |
|---                         |---                        |---|
| `eslint-common.json`       | non-react common projects | `eslint`, `eslint-config-prettier`, `eslint-plugin-import`, `eslint-plugin-prettier`, `eslint-plugin-scanjs-rules`, `eslint-plugin-security` |
| `eslint-common-react.json` | react-based projects      | all from `eslint-common.json` and `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` |
| `eslint-common-node.json`  | node-based projects       | all from `eslint-common.json`, `eslint-plugin-node` |


### Prettier

Prettier config should be extended by every cloudify-ui project/module.

#### Usage

Once `cloudify-ui-common` is installed as a dependency it is required to modify project's Prettier config (you should use JS version - `.prettierrc.js` file) by requiring common configuration the following way:
```js
module.exports = require('./node_modules/cloudify-ui-common/configs/prettier-common.json');
```
