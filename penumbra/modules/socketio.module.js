const socketio = require("socket.io");
// const autobind = require("auto-bind");

const _defaultConfig = {
  path: "/",
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
    if (!connection) {
      return;
    }
    // Map over our event handlers so our socket knows what to do on each event
    Object.entries(handlers).map(([event, entry]) => {
      if (entry && entry.listenerFunction && event) {
        connection.on(`${event}`, entry.listenerFunction);
      }
    });
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
