# Traru

Simple app for tracking trucks and their routes.

## Instalation

This project use:

### Server
- Node.js >= 4.0.0
- Loopback framework >= 2.22.0
- MongoDb >= 3.0.0
- PostCss
  - postcss-import
  - postcss-url
  - autoprefixer
  - postcss-custom-properties

### Client
- Angular material
- Babel 6
- Webpack
- Jade

install all dependencies:

```
  npm install
```
## Tests

  test written with [tape](https://github.com/substack/tape)

### Run test
```
  npm test
```
- Linting all code with jscs
- Run unit tests for client(angular)
- Run unit tests on node(server) (__in progress__)

### Run tests in development environment
```
  npm run test:watch
```
- Launch karma server with tape as framework
