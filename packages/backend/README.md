# Cloudify UI Common Backend

[![npm](https://img.shields.io/npm/v/cloudify-ui-common-backend.svg?style=flat)](https://www.npmjs.com/package/cloudify-ui-common-backend)

This package contains common TypeScript code for Cloudify UI backend applications.

The following features are provided by the package:
1. Database connection and access handling - see [`getDbModule` function](./src/db.ts)
2. Logging framework initialization  - see [`initLogging` function](./src/logger.ts)
3. Database migration capabilities - see [`runMigration` function](./src/migration.ts)

## Installation

```npm
npm install cloudify-ui-common-backend
```

## Usage

```typescript
import { getDbModule } from 'cloudify-ui-common-backend';
```

## Development

- add new code to `src` folder
- remember to export new files in `src/index.ts` (otherwise the new code will not be available in the distribution package)
- build: `npm run build` (TypeScript compilation)
- test: `npm run test` (unit testing with [Jest](https://jestjs.io/en/) testing framework), `npm run lint` (static analysis, code style check) and `npm run check-types` (TypeScript types check)
- document your code (we are using [JSdoc block tags](https://jsdoc.app/#block-tags))
