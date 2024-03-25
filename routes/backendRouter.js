let express = require("express");

let router = express.Router();


const APIUser = require("./APIuser");
const APIuser = new APIUser();

class backendRouter {
  constructor() {

  
 
    this.setupBackendRouter();
  }
  setupBackendRouter() {
    router.use("/user", APIuser.getRouter());
    router.use(function timeLog(req, res, next) {
      console.log("Time: ", Date.now());

      next();
    });
  }
  getRouter() {
    return router;
  }

}
module.exports = backendRouter;