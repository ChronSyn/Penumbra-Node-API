/**
 * This file is known as a router definition file
 * It follows a human-readable structure and all routers should follow this format
 */

// Require our error levels
const ErrorLevels = require("@Modules/errorLevels.module");
const Utils = require("@Modules/Utils.module");

module.exports = [
  {
    event: "example",
    purpose: "example socket handler",
    listenerFunction: (socket, connection) => exampleFn(socket, connection)
  }
];

/**
 *
 * @description An example function triggered by sending the 'example' event to our socket
 * @param {any} socket The socket instance
 * @param {any} connection The connection object which caused this function to be triggered
 */
const exampleFn = (socket, connection) => {
  Utils.formConsoleMessage("🔌", "test listener function on socket triggered!");
};
