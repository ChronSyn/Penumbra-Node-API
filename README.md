# 🌘 Penumbra - Node API 🌘
![version](https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000)

> Create API's with router definition files and/on socket handler files only!

#### Please note that this project is still in early beta! There will be bugs and as such it is not recommended for production usage at this time!

## Introduction
Penumbra is designed as a 'quick to prototype' framework for building simple API's. By writing 'router definition files' and 'socket handler definition files', you can easily build API's within hours instead of days.

Penumbra only provides the scaffolding for routing and handling sockets. It doesn't care about your data structures, your database setup, your front-end or anything else. A prime use case for this is database-free applications such as bridges between front-end UI's and hardware devices, or local system interfaces (in situations where you may not necessarily want to, or can't run electron).

Another use case could be as a gateway API that simply formats and forwards data from a third-party API - in these situations, you probably don't want to, or can't, store the data effectively - Penumbra provides an ideal location for formatting that data to work with your own applications before presenting it to clients through REST or websockets. One example of this is the UK rail infrastructure providers such as Network Rail and National Rail - their data can change at a moment's notice and storing it may not provide any meaningful benefit for you.

## Key Limitations

Penumbra currently has the following limitations;

 - Not typescript (Intended to be added soon)
 - Not an installable module - code needs to be written directly into this, similar to a boilerplate

## Docker Support
`Dockerfile` and `docker-compose.yml` files have been added to the project. These don't have to be used, but they're here just in case. This will allow us to potentially add further services to the project at a later date.

## PM2 Support
##

## Install (non-docker)

```sh
cd ./penumbra
yarn
```

## Install and run (docker / docker-compose)

```sh
Powershell: docker-compose build | docker-compose up

CMD/Terminal: docker-compose down && docker-compose up --detach --build --remove-orphans
```

## Run (non-docker)

```sh
cd ./penumbra
yarn start
```

## Access
Send a `GET` request to `http://localhost:8096/describe` to get a list of available endpoints. You can change this path in `application.config.js` (key `masterRouterDescribeRoute`).

You can also change the port the application listens on in the config file (key `app.port`);

## Developing

#### Routers

The core of this project is built around dynamic routing. It has been built in such a way that it allows router definition files to be dropped into `./modules/routers`. These will be automatically required by the application core when it loads, unless the router includes `.noautorequire.` somewhere in it's filename. They will then be parsed and mapped to their relevant endpoints as the application loads.

See 'exampleRouter' for details.

Inside each router endpoint, you should provide `method` (e.g. `get`), `endpoint` (e.g. `/`, `/example`), `purpose` (e.g. `example router`), and `returnFunction`. For example;

    example: {
      method: "get",
      endpoint: "/example",
      purpose: "example router",
      returnFunction: (req, res, params) => exampleFn(req, res, params)
    }

- `method`: The REST method to use
- `endpoint`: The endpoint to run on
- `purpose`: Used to describe the purpose of the route to the user
  -`returnFunction`: `{req, res, params} => ()`
    - `req`: Request object
    - `res`: Response object
    - `socket`: The socket.io instance used by our application (see below)

Since `returnFunction` passes `req`, you can use `req.query`, `req.body`, `req.params`, etc. You can also send data over websockets if you wish, allowing the application to respond to incoming REST requests and sending data on to socket clients - this is why `socket` is passed into each request function.

#### Websockets

Websocket support is provided by socket.io. As with the routing setup, sockets can be setup by writing socket handler definition files, and dropping them into `modules/socketHandlers`. If you includes `.noautorequire.` in the filename of a handler, it won't be automatically required.

See `example.socketHAndler` for details.

Inside each socket handler, you should provide `event` (e.g. `example`), `listenerFunction` (e.g `(socket, connection) => console.log(connection)`) and `purpose` (e.g. `example socket handler`). For example;

    {
      event: "example",
      purpose: "example socket handler",
      listenerFunction: (socket, connection) => exampleFn(socket, connection)
    }

Note that unlike the router, these handlers are not keyed, but are instead just objects in an array.

 - `event`: The event to listen for.
 - `listenerFunction`: `{socket, connection} => ()`
   - `socket`: The socket object which is listening for all connections
   - `connection`: The object that represents the connection which triggered this function
 - `purpose`: Used to describe the purpose of the event to the user.

## Future plans

 - Typescript Support as standard
 - Working the project into an npm-installable module
 - Apollo server integration

## Author(s)

👤 **Scott Pritchard**