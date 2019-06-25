# 🌘Penumbra - Node API🌘
![version](https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000)

> Create API's with router definition files only!

## Docker Support
`Dockerfile` and `docker-compose.yml` files have been added to the project. These don't have to be used, but they're here just in case. This will allow us to potentially add further services to the project at a later date.

## PM2 Support
##

## Install (non-docker)

```sh
cd ./isi-node-hw-bridge
yarn
```

## Install and run (docker / docker-compose)

```sh
docker-compose build | docker-compose up
```

## Run (non-docker)

```sh
cd ./isi-node-hw-bridge
yarn start
```

## Access
Send a `GET` request to `http://localhost:8096/describe` to get a list of available endpoints.

## Developing

The core of this project is built around dynamic routing. It has been built in such a way that it allows router definition files to be dropped into `./modules/hardwareRouters`. These will be automatically required by the application core when it loads, unless the router includes `.noautorequire.` somewhere in it's filename. They will then be parsed and mapped to their relevant endpoints as the application loads.

For an example of a query-driven router, see `BillValidator.router.js`. This will listen to requests on `/` and use URL query params to describe the functionality.

For an example of a endpoint-driven router, see `Gen5Printer.router.js`. This will listen to requests on `/printTest`.

Inside each router endpoint, you should provide `method` (e.g. `get`), `endpoint` (e.g. `/`, `/printTest`), `purpose` (e.g. `Gen5Printer`), and `returnFunction`. For example;

    printTest: {
      method: "get",
      endpoint: "/printTest", // This value should match the key of the parent object
      purpose: "Gen5Printer",
      returnFunction: (req, res, params) => printTestFn(req, res, params)
    }

`method`: The REST method to use

`endpoint`: The endpoint to run on

`purpose`: Used to describe the purpose to the user

[Optional]`command`: The query string to look at to determine how to proceed parsing (used by the bill validator)

`returnFunction`: `{req, res, params} => ()`
  - `req`: Request object
  - `res`: Response object
  - `params`: If this route object includes a `command` field, this will be from `req.query`, else it'll be from `req.body`

## Author(s)

👤 **[Scott Pritchard @ Korelogic](mailto:scott.pritchard@korelogic.co.uk)**


## 📝 License

Copyright © 2019 [Scott Pritchard @ Korelogic](mailto:scott.pritchard@korelogic.co.uk).