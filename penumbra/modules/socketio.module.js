const socketio = require("socket.io");
const Utils = require("@Modules/Utils.module");
const appConfig = require("../application.config");
const get = require("lodash/get");

const _defaultConfig = {
  path: get(appConfig, "app.socketPath", "/socket"),
  pingInterval: 5000,
  pingTimeout: 10000,
  cookie: false,
  transports: ["websocket"]
};


class socketioModule {
  constructor(server, handlers = {}, config = _defaultConfig) {
    // autobind();
    this.config = config;
    this.initialize(server, handlers);
  }

  
  /**
   * 
   * @param {object<any>} handlers Event handlers to assign to each connection (passed through this function down to onConnection)
   * @description Initializes our socket and listens to our http server instance, then assigned the connection and disconnection event functions
   * @returns Our socket instance
   */
  initialize(server, handlers) {
    this.socket = new socketio(server, this.config);

    Utils.formConsoleMessage(`⌛  `,`Master socketHandler has ${handlers.length} entries. The following mapping between events and functions will be available to each connection.`);
    Object.entries(handlers).map(([event, handler]) => {
      if (handler && handler.listenerFunction && event) {
        Utils.formConsoleMessage(`   👉  `,`Mapping event: ${handler.event} [${handler.purpose}]`)
      }
    });
    Utils.formConsoleMessage(`✅  `,"Finished mapping socket events!");

    // this.socket = this.socket.bind(this);

    // Assign our onConnection and onDisconnection functions
    this.socket.on("connection", () => this.onConnection(handlers));
    this.socket.on("disconnect", this.onDisconnection);
    return this.socket;
  }


  /**
   *
   * @param connection Our connection object, provided by socket.io - represents a single client
   * @param handlers Handlers to assign to our connection
   * @description Runs when a client connects
   */
  onConnection(connection, handlers = {}) {
    Utils.formConsoleMessage(`⌛  `,`Master 123 socketHandler has ${handlers.length} entries. Mapping events to functions!`);
    Object.entries(handlers).map(([event, entry]) => {
      if (entry && entry.listenerFunction && event) {
        Utils.formConsoleMessage(`   👉  `,`Mapping event: ${handler.event} [${handler.purpose}]`)
        connection.on(`${event}`, entry.listenerFunction(this.socket, connection));
      }
    });
    Utils.formConsoleMessage(`✅  `,"Finished mapping socket handlers!");

    if (!connection) {
      return;
    }
    // Map over our event handlers so our socket knows what to do on each event
    // Returns this.socket and the connection into the listenerFunction
    
    
    // We want to perform some verification on the connection to make sure our client is legitimate
  }


  /**
   * @description Runs when a client disconnects
   */
  onDisconnection() {
    // We may want to do something when a client disconnects such as preventing the bill validator from accepting bills
  }


  /**
   *
   * @param {string} event The name of the event - clients listening for this event will be able to handle it
   * @param {object<any>} args Any additional args or data to send with the command
   */
  emit(event, args = null) {
    this.socket.emit(event, args);
  }
}

module.exports = socketioModule;
