const router = require("express").Router();


class APIuser {
  constructor() {

    this.setupAPI();
  }
  setupAPI() {
    router.get("/get", async (req, res) => {

      res.send({ status: "success", data: "DEMO ENDPOINT" });

    });


  }
  getRouter() {
    return router;
  }
}

module.exports = APIuser;
