# EfreiAngularProject

## Development server

To start a local development server, run:

```bash
  npm run start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

```bash
  npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

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
