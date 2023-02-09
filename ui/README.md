# Compendium

This project serves as a tool (ui+infrastructure) to visualize vast variety of related informations in node connected graph.
To run project locally, build packages/compendium-ui via availabe script below. Then copy local/env.js.example to site/compendium-ui/env.js file and modify graphql url in that file.

## Available Scripts

In the project directory, you can run:

### `npm run build -w packages/compendium-ui`
### `npm run dev -w sites/compendium-site`

Runs the app in the development mode.\
Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/) or press 'o' in console to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## Compendium-ui package development hint

You can copy env.js.example to packages/compendium-ui folder and run following command to test compendium react component directly in package workspace (withou example site):

### `npm run dev -w packages/compendium-ui`
