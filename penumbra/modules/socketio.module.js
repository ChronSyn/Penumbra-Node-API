const socketio = require("socket.io");
const appConfig = require("@Root/application.config");
const get = require("lodash/get");
const SocketConstants = require("@Constants/SocketConstants");
const exec = require('child_process').exec;
const Utils = require("./Utils.module");

const _defaultConfig = {
  path: get(appConfig, "app.socketPath", "/socket"),
  pingInterval: 5000,
  pingTimeout: 10000,
  cookie: false,
  transports: ["websocket"]
};

class socketioModule {
  constructor(server, handlers = {}, config = _defaultConfig){
    this.config = config;
    this.initialize(server, handlers);
  }

  /**
   * 
   * @param {string} processName
   * @param {function} cb The callback function
   * @returns {boolean} True: Process running, else false
   */
  isProcessRunning(processName, cb){
    const platform = process.platform;
    const cmd = (()=>{
      switch (platform) {
        case 'win32' : return `tasklist`;
        case 'darwin' : return `ps -ax | grep ${processName}`;
        case 'linux' : return `ps -A`;
        default: return false;
      }
    })();
    exec(cmd, (err, stdout, stderr) => {
        cb(stdout.toLowerCase().indexOf(processName.toLowerCase()) > -1);
    });
  }

  initialize(server, handlers){
    this.socket = new socketio(server, this.config);
    this.socket.on("connection", (client) => {
      Utils.formConsoleMessage(`⌛  `,`Socket handlers has ${handlers.length} entries. Mapping events to listeners!`);
      handlers.map(handler => {
        Utils.formConsoleMessage(`   👉  `,`Mapping socket event: ${get(handler, "event", "").toUpperCase()} [${get(handler, "purpose", "")}]`)
        client.on(handler.event, () => {
          Utils.formConsoleMessage("\n\n      🔌 ", `Socket event "${handler.event}" triggered [${handler.purpose}]`);
          handler.listenerFunction(socket, client)
        });
      })
    });
  }

}

module.exports = socketioModule;