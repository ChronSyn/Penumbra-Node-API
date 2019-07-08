/**
 * This file is known as a router definition file
 * It follows a human-readable structure and all routers should follow this format
 */


// Require our error levels
const ErrorLevels = require("@Modules/errorLevels.module");
const Utils = require("@Modules/Utils.module");
const appConfig = require("@Root/application.config");

module.exports = {
  routes: {
    example: {
      method: "get",
      endpoint: "/example",
      purpose: "exampleRouter",
      returnFunction: (req, res, socket) => exampleFn(req, res, socket)
    },
    socketTest: {
      method: "get",
      endpoint: "/socketTest",
      purpose: "socket test page",
      returnFunction: (req, res, socket) => socketTestFn(req, res, socket)
    },
    
  }
};

const BvBillInFn = (req, res, socket) => {
  res.send("bvbillin");
};

const BvStatusFn = (req, res, socket) => {
  res.send("bvstatus");
};


/**
 * @description Our function for the example route command
 * @param req A request object from express
 * @param res A response object from express
 * @param params The params passed into the endpoint - sources could be req.query, req.params, etc
 */
const exampleFn = (req, res, socket) => {
  Utils.formConsoleMessage("✅","Example route function run!")
  // Send "OK" to the driver to let it know we haven't crashed (in case it's checking for response)
  res.send("If you can see this, you're up and running!");
}

const socketTestFn = (req, res, socket) => {
  Utils.formConsoleMessage("🔌", "Socket test page function run!")
  res.send(`
    <script src="http://localhost:8096${appConfig.app.socketPath}/socket.io.js"></script>
    <script>
      const socket = io("http://localhost:8096", {
        path: "${appConfig.app.socketPath}",
        transports: ["websocket"],
        autoConnect: true
      });
      socket.emit("example",{event: "example", ClientSecret: "1234", AuthFields: { ExecutablePath: "${encodeURI("C:/Program files/cpuid/cpu-z/cpuz.exe")}"}});
    </script>
    OK
  `)
}