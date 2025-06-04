require("dotenv").config();
const express = require("express");
const http = require("http");
const { default: helmet } = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { initSocket } = require("./db/init.socket");
const { consumer } = require("./services/rabbitMQ.service");
const app = express();
const credentials = require("./middlewares/credentials");
const corsOptions = require('./configs/corsOptions')
const {readFileSync} = require('fs')
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



// Khởi động consumer cho SMS queue
// const startSmsConsumer = async () => {
//   try {
//     console.log('Starting SMS consumer...');
//     await consumer('sms_queue');
//     console.log('SMS consumer started successfully');
//   } catch (error) {
//     console.error('Failed to start SMS consumer:', error);
//   }
// };

// // Khởi động consumer
// startSmsConsumer();

// init db
require("./db/init.mongodb");
// init schedule service
require("./services/schedule.service");
// socket
// initSocket(server);
// ioredis
// const ioRedis = require("./db/init.ioredis");
// ioRedis.init({
//   IOREDIS_IS_ENABLED: true,
// });
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
