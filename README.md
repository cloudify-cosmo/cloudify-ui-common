# Cloudify UI Common

Cloudify UI Common library is a monorepo containing multiple packages published in [NPM](https://www.npmjs.com)
registry. 

## Packages

Packages are stored in [packages](./packages) directory:
1. [backend](./packages/backend)
1. [configs](./packages/configs)
1. [cypress](./packages/cypress)
1. [frontend](./packages/frontend)
1. [scripts](./packages/scripts)

Package content description is provided in `README.md` files in each package directory.

## Development

This monorepo uses [NPM workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) to manage multiple packages 
within a singular top-level, root package.

To install dependencies for all packages from root package, run:
```
npm ci
```

To run any NPM script for specific package from root package, run: 
```
npm run <script-name> --workspace packages/<package-name>
```

To run any NPM script for all packages only if the script exists, run:
```
npm run <script-name> --workspaces --if-present
```

## Debugging

If you want to develop/debug `cloudify-ui-common-<package-name>` from the package user side (eg. from [cloudify-stage]
(https://github.com/cloudify-cosmo/cloudify-stage)), then instead of using `cloudify-ui-common-<package-name>` package from NPM 
registry, you can:
1. Use `npm link cloudify-ui-common-<package-name> <local-path-to-cloudify-ui-common-<package-name>>` command in your package user project,
1. Build `cloudify-ui-common-<package-name>` package (see: [Development](#development) section),
1. Run package user project and see changes applied locally in `cloudify-ui-common-<package-name>` package.

## Publishing

The way of work with publishing the package is described below. This section is divided into 3 parts:
1. **When?** - describes when we can publish the package,
1. **Who?** - describes who can publish the package and under which conditions,
1. **How?** - describes technical details to follow to publish the package.

#### When?

We can release when:
- code on `master` branch is necessary for one of the dependant projects (stage, composer, topology, ...),
- fix/feature on `master` branch is finished.

#### Who?

Developers from _cloudify-rnd-ui_ e-mail group can publish new version after agreement with maintainer
(see author or maintainers field in [package.json](./package.json) file).

#### How?

This section is divided into two parts:
1. **Checklist** - describes prerquisities to be met before publishing the package,
1. **Steps** - describes technical steps to be executed to publish the package.

##### Checklist

* all your changes are merged to `master` branch, so that your local `master` branch is up-to-date,
* you know and follow [Semantic Versioning](https://semver.org/#summary) rules when creating new version,
* you know and follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/#how) guiding principles when adding release notes,
* you have agreement with developers from _cloudify-rnd-ui_ group on publishing new version.

##### Steps

If you met all points from the checklist above, follow these steps:

1. Provide version type and package name to `npm run publish`. For example:

    * `npm run publish -- minor cypress` - to publish new minor version of `cloudify-ui-common-cypress` package
    * `npm run publish -- prepatch scripts` - to publish new prerelease patch version of `cloudify-ui-common-scripts` 
      package
  
   It will create special branch, add commit to it containing version bump in `package*.json` files according to your 
   choice, tag the commit and push branch to remote. That should trigger Jenkins jobs finalizing publish.

1. Check if Jenkins jobs were successful.

1. Verify that NPM package at `https://www.npmjs.com/package/cloudify-ui-common-<package-name>` was updated properly.

1. Go to [Create Release page @ GitHub](https://github.com/cloudify-cosmo/cloudify-ui-common/releases/new) to create
   release and add release notes according to [Keep a Changelog](https://keepachangelog.com/en/1.1.0/#how) guiding
   principles (in addition to the types of changes described there, you can use `Internal` type for all non-user-facing
   changes).
