# Pepperdata data source plugin

Grafana datasource plugin that allows you to query Pepperdata dashboard metrics data for display in Grafana dashboards.

## Prerequisites

These steps assume you're running MacOS. To run this plugin locally in dev mode, you will need to:

1. Install Grafana

   ```bash
   brew install grafana
   ```

2. Link your local plugin repo to the grafana plugins directory.

   ```bash
   # Create a plugin directory
   mkdir ~/grafana-plugins

   # Set this directory as the grafana pluginsDir
   grafana cli --pluginsDir "~/grafana-plugins"

   # Link your local repo to the plugins directory
   cd ~/grafana-plugins
   ln -s <path_to_plugin_directory> .
   ```

3. Edit your grafana.ini to run Grafana in development mode. By default the config file is located at `/usr/local/etc/grafana/grafana.ini`.

   ```bash
   app_mode = development
   ```

## Getting started

1. Install dependencies

   ```bash
   npm install
   ```

2. Build plugin in development mode and run in watch mode

   ```bash
   npm run dev
   ```

3. Build plugin in production mode

   ```bash
   npm run build
   ```

4. Run the tests (using Jest)

   ```bash
   # Runs the tests and watches for changes, requires git init first
   npm run test

   # Exits after running all the tests
   npm run test:ci
   ```

5. Start the Grafana service:

   ```bash
   brew services start grafana
   ```

   Optionally you can spin up a Grafana docker image that will run the plugin:

   ```bash
   npm run server
   ```

6. Run the E2E tests (using Cypress)

   ```bash
   # Spins up a Grafana instance first that we tests against
   npm run server

   # Starts the tests
   npm run e2e
   ```

7. Run the linter

   ```bash
   npm run lint

   # or

   npm run lint:fix
   ```

# Distributing your plugin

When distributing a Grafana plugin either within the community or privately the plugin must be signed so the Grafana application can verify its authenticity. This can be done with the `@grafana/sign-plugin` package.

_Note: It's not necessary to sign a plugin during development. The docker development environment that is scaffolded with `@grafana/create-plugin` caters for running the plugin without a signature._

## Initial steps

Before signing a plugin please read the Grafana [plugin publishing and signing criteria](https://grafana.com/docs/grafana/latest/developers/plugins/publishing-and-signing-criteria/) documentation carefully.

`@grafana/create-plugin` has added the necessary commands and workflows to make signing and distributing a plugin via the grafana plugins catalog as straightforward as possible.

Before signing a plugin for the first time please consult the Grafana [plugin signature levels](https://grafana.com/docs/grafana/latest/developers/plugins/sign-a-plugin/#plugin-signature-levels) documentation to understand the differences between the types of signature level.

1. Create a [Grafana Cloud account](https://grafana.com/signup).
2. Make sure that the first part of the plugin ID matches the slug of your Grafana Cloud account.
   - _You can find the plugin ID in the `plugin.json` file inside your plugin directory. For example, if your account slug is `acmecorp`, you need to prefix the plugin ID with `acmecorp-`._
3. Create a Grafana Cloud API key with the `PluginPublisher` role.
4. Keep a record of this API key as it will be required for signing a plugin

## Signing a plugin

### Using Github actions release workflow

If the plugin is using the github actions supplied with `@grafana/create-plugin` signing a plugin is included out of the box. The [release workflow](./.github/workflows/release.yml) can prepare everything to make submitting your plugin to Grafana as easy as possible. Before being able to sign the plugin however a secret needs adding to the Github repository.

1. Please navigate to "settings > secrets > actions" within your repo to create secrets.
2. Click "New repository secret"
3. Name the secret "GRAFANA_API_KEY"
4. Paste your Grafana Cloud API key in the Secret field
5. Click "Add secret"

#### Push a version tag

To trigger the workflow we need to push a version tag to github. This can be achieved with the following steps:

1. Run `npm version <major|minor|patch>`
2. Run `git push origin main --follow-tags`

## Learn more

Below you can find source code for existing app plugins and other related documentation.

- [Basic data source plugin example](https://github.com/grafana/grafana-plugin-examples/tree/master/examples/datasource-basic#readme)
- [`plugin.json` documentation](https://grafana.com/developers/plugin-tools/reference-plugin-json)
- [How to sign a plugin?](https://grafana.com/docs/grafana/latest/developers/plugins/sign-a-plugin/)
