This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). It uses [Wiremock](https://github.com/WireMock-Net/WireMock.Net-docker) for mock endpoints.

## Create React App scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Development Cycle

1. In the /mocks folder, run `docker-compose up -d mocks`
2. Run `docker ps` to get the port
3. Update the port in `index.tsx`
4. In the /frontend folder, run `npm start`

## Debugging

### Mock endpoint returning unexpected 404

Usually this means one of the configuration files for the mocks is incorrect, and those endpoints were not loaded. Run `docker logs habits-mocks` and look at the beginning of the file.