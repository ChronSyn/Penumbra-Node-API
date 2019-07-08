require('module-alias/register')

const appConfig = require("@Root/application.config");
const findUp = require("find-up");
// Require express and create our app
const fs = require("fs");
const path = require("path");
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
Utils.formConsoleMessage(`⌛  `,`Requiring socker handlers!`);

// We read the aliases from package.json so that we can use the same path with readFileSync
const packageJsonPath = findUp.sync("package.json");
const packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const aliases = get(packageJsonContent, "_moduleAliases");

const SocketHandlersPath = `${path.dirname(packageJsonPath)}/${get(aliases, "@Modules/socketHandlers", "./modules/socketHandlers")}`;
const SocketHandlersDirFiles = fs.readdirSync(SocketHandlersPath);

const SocketHandlers = [...SocketHandlersDirFiles.filter(socketHandlerFilename => !socketHandlerFilename.includes(".noautorequire.")).map(socketHandlerFilename => {
  Utils.formConsoleMessage(`   👉  `,`Required: ${SocketHandlersPath}/${socketHandlerFilename}`);
  return require(`${SocketHandlersPath}/${socketHandlerFilename}`)
})];
Utils.formConsoleMessage(`✅  `,"Finished requiring socket handler definition files!");

const masterSocketHandlers = flattenDeep(SocketHandlers);
const socket = new socketModule(server, masterSocketHandlers);

Utils.formConsoleMessage(`⌛  `,`Requiring routers!`);

// We require all the routers that are in our routers directory, preferring the alias folder that's in package.json but falling back to ./modules/routers
const RoutersPath = `${path.dirname(packageJsonPath)}/${get(aliases, "@Routers", "./modules/routers")}`;
const routerDirFiles = fs.readdirSync(RoutersPath);
const Routers = [...routerDirFiles.filter(routerFilename => !routerFilename.includes(".noautorequire.")).map(routerFilename => {
  Utils.formConsoleMessage(`   👉  `,`Required: ${RoutersPath}/${routerFilename}`);
  return require(`${RoutersPath}/${routerFilename}`)
})];

if (Routers.length <= 0){
  console.error(`❌ You have not required any routers - the application won't be able to communicate with any other application and no endpoints are available! Check that at least 1 of them does not have ".noautorequire." in it's filename!`)
  return process.exit();
}
Utils.formConsoleMessage(`✅  `,"Finished requiring router definition files!");

// Map over each of our routers to form the master that our express app will use
const masterRouter = flattenDeep(Routers.map(routerDef => {
  return Object.entries(routerDef.routes).map(([key, route]) => route);
}));

// Check if we have a "/" endpoint - all routes return 404 if not
const hasBareRoute = masterRouter.filter(masterRouterEntry => masterRouterEntry.endpoint === "/").length > 0;
if (!hasBareRoute){
  Utils.formConsoleMessage(`🚩  `, "You do not have a route on '/'. The application requires one to be provided! We'll set up a default empty one for you!");
  masterRouter.push({
    method: "get",
    endpoint: "/",
    purpose: "default route",
    returnFunction: (req, res) => res.send("")
  });
}

Utils.formConsoleMessage(`⌛  `,`Master router has ${masterRouter.length} entries. Mapping to endpoints!`);

// Create the router that our express app will use
const router = express.Router();

// Map over each route and setup the endpoints
masterRouter.map(route => {

  // Tell our express app to form a router and the endpoint to listen on 
  app.use(route.endpoint, router);
  Utils.formConsoleMessage(`   👉  `,`Mapping endpoint: ${get(route, "method", "").toUpperCase()} ${get(route, "endpoint","")} [${get(route, "purpose", "")}]`)

  // Create paths to each endpoint
  router[route.method](route.endpoint, (req, res) => {
    try {
      const routeHandler = masterRouter.filter(masterRouterEntry => masterRouterEntry.endpoint && masterRouterEntry.endpoint.toUpperCase() === req.originalUrl.toUpperCase())[0];
      routeHandler.returnFunction(req, res, socket);
    } catch (error) {      
      // Since this function will only run when a matched route is requested, we know that there was an error handling the request (e.g. status 500)
      // i.e. this means we can't ever get a 404 error here. This is handled below.
      return res.status(500).send({statusCode: res.statusCode, error: true, errorMessage: error.message, stack: JSON.stringify(error) })
    }
  });
});

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