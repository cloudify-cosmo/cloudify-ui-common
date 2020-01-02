## ESLint

This directory contains ESLint configs that should be extended by every cloudify-ui project/module.

### Usage

Once `cloudify-ui-common` is installed as a dependency it is required to modify project's ESLint config (most probably `.eslintrc` or `.eslintrc.json` file) by adding the following entry (assuming ESLint config file is located in top level directory and it is a non-react project):
```json
{
  "extends": ["./node_modules/cloudify-ui-common/eslint/eslint-common.json"]
}
```
It is also required to install peer dependencies as specified in `package.json`. For react-based projects all specified dependencies need to be installed, whereas for non-react projects `eslint-plugin-react` and `eslint-plugin-jsx-a11y` are not necessary and can be skipped.

There are two configuration files that can be extended:

* `eslint-common.json` - configuration file that should be extended by all non-react projects
* `eslint-common-react.json` - configuration file that should be extended by all react-based projects
