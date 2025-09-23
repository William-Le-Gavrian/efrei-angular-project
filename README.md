# EfreiAngularProject

## Author: William Le Gavrian

## Development server

To start a local development server, run:

```bash
  npm run start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

```bash
  npm run build
```

This will compile the project and store the build artifacts in the `dist/` directory. 

If you want to build the project for production in order to run it with http-server :

```bash
  npm run build --prod
```

Then, if you want to run the server with http-server :

```bash
  npm run start:http
```

The server will run on :
- http://172.22.48.1:8080                                                                                                                                                                                
- http://192.168.0.39:8080                                                                                                                                                                               
- http://127.0.0.1:8080

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
  npm run test
```

## Deploy

The app is deployed on this link: https://efrei-angular-project-git-dev-william-le-gavrians-projects.vercel.app

The API used to display Apple stocks on a graph in the transactions' page is limited to 8 requests per minute and 800 per day.
So if the page is reloaded too many times in a short time, the Apple stocks might not appear.
