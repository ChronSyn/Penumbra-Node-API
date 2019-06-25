// Require express and create our app
const fs = require("fs");
const express = require("express");
const http = require("http");
const app = express();
const appConfig = require("./application.config");
const flattenDeep = require("lodash/flattenDeep");
const middleware = require("@Modules/middleware.module")(app);
const Utils = require("@Modules/Utils.module");
const socketModule = require("@Modules/socketio.module");

Utils.formConsoleMessage("🔌", "Attempting to connect to all COM ports 0 through 10.")
Utils.formConsoleMessage("🔌", "Finished attempting to connect to COM ports.");

const server = http.createServer(app);

/*
  Require our routers
  You can simply add a new router definition file to the folder and it'll be required automatically
  If a router includes .noautorequire. in it's filename, it won't be automatically `require`d
*/
Utils.formConsoleMessage(`🔥  `,`Penumbra is firing up!`);
Utils.formConsoleMessage(`⌛  `,`Requiring routers!`);
const HWRoutersPath = "./modules/routers";
const routerDirFiles = fs.readdirSync(HWRoutersPath);
const HardwareRouters = [...routerDirFiles.filter(routerFilename => !routerFilename.includes(".noautorequire.")).map(routerFilename => {
  Utils.formConsoleMessage(`   👉  `,`Required: ${HWRoutersPath}/${routerFilename}`);
  return require(`${HWRoutersPath}/${routerFilename}`)
})];

if (HardwareRouters.length <= 0){
  console.error(`❌ You have not required any routers - the application won't be able to communicate with any other application and no endpoints are available! Check that at least 1 of them does not have ".noautorequire." in it's filename!`)
  return process.exit();
}
Utils.formConsoleMessage(`✅  `,"Finished requiring routers!");

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

const exampleHandler = {
  test: {
    listenerFunction: () => { utils.formConsoleMessage("🔌", "test listener function on socket triggered!") }
  }
}
const socket = new socketModule(server, exampleHandler);

// Add a /describe route which will send a list of available endpoints
router.get("/describe", ({res}) => {
  res.send(masterRouter)
});

Utils.formConsoleMessage(`✅  `,"Finished mapping endpoints!");
Utils.formConsoleMessage(`🌲  `,"Send a GET request to '/describe' to list available endpoints!");


app.use(({res})=>{
  return res.status(404).send({statusCode: res.statusCode, error: true, errorMessage: "Route not found"})
});

// Tell app to listen on port
server.listen(appConfig.app.port, () => {
  Utils.formConsoleMessage(`👂  `,`Listening on port ${appConfig.app.port}`);
})