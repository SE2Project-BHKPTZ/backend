require('dotenv').config()

const BackendRouter = require("./routes/backendRouter");
const backendRouter = new BackendRouter();

const Web = require("./web");
const web = new Web(backendRouter.getRouter());

const WS = require("./ws");
const ws = new WS(web.getServer());