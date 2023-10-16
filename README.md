# Compendium

This project serves as a tool (ui+infrastructure) to visualize vast variety of related information in node connected graph.
To run project locally, build packages/compendium-ui via available script below. Then copy local/env.js.example to site/compendium-ui/env.js file and modify graphql url in that file.

## Available Scripts

In the project directory, you can run:

### `npm run build -w packages/compendium-ui`
### `npm run dev -w examples/compendium-site`

Runs the app in the development mode.\
Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/) or press 'o' in console to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

To build cdk construct run:

### `npm run build -w packages/compendium-cdk`


## Compendium-ui package development hint

You can copy env.js.example to packages/compendium-ui folder and run following command to test compendium react component directly in package workspace (without example site):

### `npm run dev -w packages/compendium-ui`


## Release management

The repository contains GitHub workflow to publish packages to the npm registry after a successful merge to the main branch. CI/CD pipeline is triggered only when changes are made to the specific package (e.g. `packages/compendium-cdk`). To publish a new version of the package, follow the next steps:

- Implement changes in the new branch
- Increase the version of your package in `package.json`, following [semantic versioning](https://semver.org/) (!important, otherwise package with the wrong version will be published)
- Alternatively you can use `npm version <update-type> -w <workspace-of-your-package>` command, see [updating-your-published-package-version-number](https://docs.npmjs.com/updating-your-published-package-version-number)
- Create a Pull Request to merge your branch with the main
- After merging to the main branch, CI/CD pipeline does the rest
