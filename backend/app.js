// app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
// ... other requires except http, Server (socket.io), and db setup that depends on listen

const app = express();

// apply helmet, cors, express.json, routes, etc.
// DO NOT call httpServer.listen here
// DO keep all your routes: /register, /login, /projects, /time, etc.

module.exports = app;
