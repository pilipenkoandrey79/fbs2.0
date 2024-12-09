# Fbs2.0

## Start the application

Run `npx nx serve fbs2.0` to start the development server. Happy coding!

## Build for production

Run `npx nx build fbs2.0` to build the application. The build artifacts are stored in the output directory (e.g. `dist/` or `build/`), ready to be deployed.

## Backup in pgAdmin:

- select existed file in .sql format
- on Tab Options select quoting
- nothing more
  to restore:
- only select backup file

## Generate openapi module:

`openapi-generator-cli generate -g typescript-axios -o apps/client/src/mono-api -i openapi.json --additional-properties='supportsES6=true'`

## Update dependencies

`npx npm-check-updates -u`
