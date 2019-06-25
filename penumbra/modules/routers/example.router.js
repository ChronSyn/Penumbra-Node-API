/**
 * This file is known as a router definition file
 * It follows a human-readable structure and all routers should follow this format
 */


// Require our error levels
const ErrorLevels = require("@Modules/errorLevels.module");
const Utils = require("@Modules/Utils.module");

module.exports = {
  name: "exampleRouter",
  endpoint: "/",
  routes: {
    example: {
      method: "get",
      endpoint: "/example",
      purpose: "exampleRouter",
      returnFunction: (req, res, params) => exampleFn(req, res, params)
    },
  }
};


/**
 * @description Our function for the example route command
 * @param req A request object from express
 * @param res A response object from express
 * @param params The params passed into the endpoint - sources could be req.query, req.params, etc
 */
const exampleFn = (req, res, params) => {
  Utils.formConsoleMessage("✅","Example route function run!")
  // Send "OK" to the driver to let it know we haven't crashed (in case it's checking for response)
  res.send("If you can see this, you're up and running!");
}