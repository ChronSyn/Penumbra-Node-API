# 🌘Penumbra - Node API🌘
![version](https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000)

> Create API's with router definition files and/on socket handler files only!

## Docker Support
`Dockerfile` and `docker-compose.yml` files have been added to the project. These don't have to be used, but they're here just in case. This will allow us to potentially add further services to the project at a later date.

## PM2 Support
##

## Install (non-docker)

```sh
cd ./penumbra-node-api
yarn
```

## Install and run (docker / docker-compose)

```sh
docker-compose build | docker-compose up
```

## Run (non-docker)

```sh
cd ./penumbra-node-api
yarn start
```

## Access
Send a `GET` request to `http://localhost:8096/describe` to get a list of available endpoints.

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

`method`: The REST method to use

`endpoint`: The endpoint to run on

`purpose`: Used to describe the purpose to the user

[DEPRECATED] [Optional]`command`: The query string to look at to determine how to proceed parsing

`returnFunction`: `{req, res, params} => ()`
  - `req`: Request object
  - `res`: Response object
  - `params`: If this route object includes a `command` field, this will be from `req.query`, else it'll be from `req.body`

#### Websockets

Websocket support is provided by socket.io. This is currently a WIP but will soon function very similarly to the routers development experience discussed above.

## Author(s)

👤 **[Scott Pritchard](mailto:scott@iocu.be)**


## 📝 License

Copyright © 2019 [Scott Pritchard @ Korelogic](mailto:scott@iocu.be).