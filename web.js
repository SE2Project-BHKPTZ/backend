const fs = require("fs");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");

let server

class web {
  constructor(backendRouter) {
    this.backendRouter = backendRouter;
    this.setupWeb();
  }
  setupWeb() {
    const app = express();

    app.use(function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      next();
    });

    app.use(cors());

    //SOCKET IO ADMIN UI
    app.use("/sioadmin",express.static('./node_modules/@socket.io/admin-ui/ui/dist'))

    
    app.use(bodyParser.json({ limit: "50mb" }));
    app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
    app.use("/", this.backendRouter);
    

    server = http.createServer(app)

    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });

  }
  getServer() {
    return server;
  }

}
module.exports = web;
