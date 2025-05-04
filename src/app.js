require("dotenv").config();
const express = require("express");
const http = require("http");
const { default: helmet } = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { initSocket } = require("./db/init.socket");
const app = express();
const credentials = require("./middlewares/credentials");
const corsOptions = require('./configs/corsOptions')

// init middlewares
const server = http.createServer(app);
// app.options('*', cors(corsOptions));
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "50mb" })); // Tăng giới hạn cho JSON payload
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Tăng giới 
app.use(cookieParser());
app.use(credentials);
app.use(cors(corsOptions));
// init db
require("./db/init.mongodb");
// redis
// const initRedis = require('./db/init.redis');
// initRedis.initRedis()
// const { checkOverload } = require('./helpers/check.connect')
// checkOverload()

const portSocket = 8000;
initSocket(server);
server.listen(portSocket, () => {
  console.log(`Socket starting with ${portSocket}`);
});
// ioredis
const ioRedis = require("./db/init.ioredis");
ioRedis.init({
  IOREDIS_IS_ENABLED: true,
});
// init router
app.use("/", require("./routes"));

// handling error
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    stack: error.stack,
    message: error.message || "Internal Server Error",
  });
});
module.exports = app;
