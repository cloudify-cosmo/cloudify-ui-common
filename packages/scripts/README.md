# Cloudify UI Common Scripts

[![npm](https://img.shields.io/npm/v/cloudify-ui-common-scripts.svg?style=flat)](https://www.npmjs.com/package/cloudify-ui-common-scripts)

This package contains common shell scripts:

1. [`create-version.sh`](./create-version.sh) - provides helper function for creating new version of NPM package by creating a new 
   branch with version change commit and pushing that branch to the remote repository.

2. [`get-ts-migration-progress.sh`](./get-ts-migration-progress.sh) - prints the summary of the migration to TypeScript.

3. [`upload-package.sh`](./upload-package.sh) - provides helper function for uploading package file to the remote machine using SSH 
   and running specified command remotely.

## Installation

```npm
npm install cloudify-ui-common-scripts
```

## Usage

```shell
NODE_MODULES_PATH="$( npm root )"
${NODE_MODULES_PATH}/cloudify-ui-common-scripts/get-ts-migration-progress.sh .
```
