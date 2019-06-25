const timeout = require("connect-timeout");
const compression = require("compression")
const helmet = require("helmet");
const express = require("express");
const Utils = require("./Utils.module");

module.exports = (app) => {
  app.use((req, res, next) => {
    // Set the request start time
    req.start = new Date().getTime();

    // Prevent favicon from creating log entries
    if(req.path === '/favicon.ico'){
      return res.status(200).send("");
    }
    next();
  });
  app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  app.use(helmet());
  app.use(timeout("30s"));
  app.use(compression({level: 9}))
  app.use(express.json());
  app.use((req, res, next) => {
    // Assign the original res.end function so we can reassign it later
    const end = res.end;

    // Override res.end to allow us to get the status code
    // Log some details of the request
    res.end = (chunk, encoding) => {
      const time = new Date().getTime() - req.start;
      Utils.formConsoleMessage("\n\n      ⚡ ", `${req.method.toUpperCase()} to path: ${req.originalUrl}`);
      Utils.formConsoleMessage("      ↪", `Response time: ~ ${time} ms`);
      Utils.formConsoleMessage("      ↪", `Status code: ${res.statusCode}`);
      Utils.formConsoleMessage("💬 ", `Request handler output;`);
      res.end = end;
      res.end(chunk, encoding);
    }
    next()
  });
};