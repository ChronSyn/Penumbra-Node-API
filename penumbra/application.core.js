const appConfig = require("./application.config");
// Require express and create our app
const fs = require("fs");
const express = require("express");
const http = require("http");
const app = express();
const flattenDeep = require("lodash/flattenDeep");
const get = require("lodash/get");
const middleware = require("@Modules/middleware.module")(app);
const Utils = require("@Modules/Utils.module");
const socketModule = require("@Modules/socketio.module");
const server = http.createServer(app);

// Get the master describe route (tells us what routes are available), checks if it begins with "/", and prefixes it if not
const _getMasterRouterDescribeRoute = get(appConfig, "app.masterRouterDescribeRoute", "/describe");
const masterRouterDescribeRoute = _getMasterRouterDescribeRoute.split("")[0] === "/" ? _getMasterRouterDescribeRoute : `/${_getMasterRouterDescribeRoute}`;

/*
  Require our routers
  You can simply add a new router definition file to the folder and it'll be required automatically
  If a router includes .noautorequire. in it's filename, it won't be automatically `require`d
*/
Utils.formConsoleMessage(`🔥  `,`Penumbra is firing up!`);
Utils.formConsoleMessage(`⌛  `,`Requiring routers!`);
const RoutersPath = "./modules/routers";
const routerDirFiles = fs.readdirSync(RoutersPath);
const HardwareRouters = [...routerDirFiles.filter(routerFilename => !routerFilename.includes(".noautorequire.")).map(routerFilename => {
  Utils.formConsoleMessage(`   👉  `,`Required: ${RoutersPath}/${routerFilename}`);
  return require(`${RoutersPath}/${routerFilename}`)
})];

if (HardwareRouters.length <= 0){
  console.error(`❌ You have not required any routers - the application won't be able to communicate with any other application and no endpoints are available! Check that at least 1 of them does not have ".noautorequire." in it's filename!`)
  return process.exit();
}
Utils.formConsoleMessage(`✅  `,"Finished requiring router definition files!");

// Map over each of our hardware routers to form the master that our express app will use
const masterRouter = flattenDeep(HardwareRouters.map(routerDef => {
  return Object.entries(routerDef.routes).map(([key, route]) => route);
}));

// Check if we have a "/" endpoint - all routes return 404 if not
const hasBareRoute = masterRouter.filter(masterRouterEntry => masterRouterEntry.endpoint === "/").length > 0;
if (!hasBareRoute){
  Utils.formConsoleMessage(`🚩  `, "You do not have a route on '/'. The application requires one to be provided! We'll set up a default empty one for you!");
  masterRouter.push({
    method: "get",
    endpoint: "/",
    purpose: "default",
    returnFunction: ({res}) => res.send("")
  });
}

Utils.formConsoleMessage(`⌛  `,`Master router has ${masterRouter.length} entries. Mapping to endpoints!`);

// Create the router that our express app will use
const router = express.Router();

// Map over each route and setup the endpoints
masterRouter.map(route => {

  // Tell our express app to form a router and the endpoint to listen on 
  app.use(`${route.endpoint}`, router);
  Utils.formConsoleMessage(`   👉  `,`Mapping endpoint: ${route.method.toUpperCase()} ${route.endpoint}${route.command ? `?Command=${route.command}` : ''} [${route.purpose}]`)

  // Create paths to each endpoint
  router[route.method](route.endpoint, (req, res) => {
    try{
      const routeHandler = !!route.command
        ? masterRouter.filter(masterRouterEntry => masterRouterEntry.command && masterRouterEntry.command.toUpperCase() === req.query.Command.toUpperCase())[0]
        : masterRouter.filter(masterRouterEntry => masterRouterEntry.endpoint && masterRouterEntry.endpoint.toUpperCase() === req.path.toUpperCase())[0]

      const paramsSource = !!route.command
        ? req.query
        : req.body

      // Run our function (req, res, params)
      routeHandler.returnFunction(req, res, paramsSource);
    } catch (error) {
      
      // Since this function will only run when a matched route is requested, we know that there was an error handling the request (e.g. status 500)
      // i.e. this means we can't ever get a 404 error here. This is handled below.
      return res.status(500).send({statusCode: res.statusCode, error: true, errorMessage: error.message, stack: JSON.stringify(error) })
    }
  });
});

const SocketHandlersPath = "./modules/socketHandlers";
const SocketHandlersDirFiles = fs.readdirSync(SocketHandlersPath);
Utils.formConsoleMessage(`⌛  `,`Requiring socker handlers!`);

const SocketHandlers = [...SocketHandlersDirFiles.filter(socketHandlerFilename => !socketHandlerFilename.includes(".noautorequire.")).map(socketHandlerFilename => {
  Utils.formConsoleMessage(`   👉  `,`Required: ${SocketHandlersPath}/${socketHandlerFilename}`);
  return require(`${SocketHandlersPath}/${socketHandlerFilename}`)
})];
Utils.formConsoleMessage(`✅  `,"Finished requiring socket handler definition files!");

const masterSocketHandlers = flattenDeep(SocketHandlers);
const socket = new socketModule(server, masterSocketHandlers);

const hasDescribeRoute = masterRouter.filter(masterRouterEntry => masterRouterEntry.endpoint === masterRouterDescribeRoute).length > 0;
if (hasDescribeRoute){
  Utils.formConsoleMessage("⛔", `A route is already on '${masterRouterDescribeRoute}'.`)
  Utils.formConsoleMessage("⛔", `This is used to list endpoints. Penumbra can't continue.`)
  Utils.formConsoleMessage("⛔", `Please update masterRouterDescribeRoute in application.config.js`)
}else{
  // Add a /describe route which will send a list of available endpoints
  router.get(masterRouterDescribeRoute, ({res}) => {
    res.send({routes: masterRouter, socketEvents: masterSocketHandlers})
  });
  Utils.formConsoleMessage(`🌲  `,`Send a GET request to '${masterRouterDescribeRoute}' to list available endpoints!`);
};

app.use(({res})=>{
  return res.status(404).send({statusCode: res.statusCode, error: true, errorMessage: "Route not found"})
});

// Tell app to listen on port
server.listen(get(appConfig, "app.port", 8096), () => {
  Utils.formConsoleMessage(`✅  👂  `,`Listening on port ${appConfig.app.port}`);
})