"use strict";
const Redis = require("ioredis");
const { RedisErrorResponse } = require("../core/error.response");

const clients = {};
let statusConnectRedis = {
    CONNECT: "connect",
    END: "end",
    RECONNECT: "reconnecting",
    ERROR: "error",
  },
  REDIS_CONNECT_TIMEOUT = 10000,
  REDIS_CONNECT_MESSAGE = {
    code: -99,
    message: {
      vn: "Redis loi roi anh em oi",
      en: "Service connection error",
    },
  },
  connectionTimeout;
const handleTimeoutError = () => {
  connectionTimeout = setTimeout(() => {
    throw new RedisErrorResponse({
      message: REDIS_CONNECT_MESSAGE.message.vn,
      statusCode: REDIS_CONNECT_MESSAGE.code,
    });
  }, REDIS_CONNECT_TIMEOUT);
};
const handleEventConnection = async ({ connectionRedis }) => {
  connectionRedis.on(statusConnectRedis.CONNECT, () => {
    console.log(`connectionIORedis - Connection status: connected`);
    clearTimeout(connectionTimeout);
  });
  connectionRedis.on(statusConnectRedis.END, () => {
    console.log(`connectionIORedis - Connection status: disconnected`);
    // retry connect
    handleTimeoutError();
  });
  connectionRedis.on(statusConnectRedis.RECONNECT, () => {
    console.log(`connectionIORedis - Connection status: reconnecting`);
    clearTimeout(connectionTimeout);
  });
  connectionRedis.on(statusConnectRedis.ERROR, (error) => {
    console.log(`connectionIORedis - Connection status: error ${error}`);
    // retry connect
    handleTimeoutError();
  });
};

const init = ({
  IOREDIS_IS_ENABLED,
  IOREDIS_HOST = process.env.REDIS_HOST,
  IOREDIS_PORT = process.env.REDIS_PORT,
}) => {
  if (IOREDIS_IS_ENABLED) {
    const instanceRedis = new Redis({
      host: IOREDIS_HOST,
      port: IOREDIS_PORT,
    });
    clients.instanceConnect = instanceRedis;
    handleEventConnection({
      connectionRedis: instanceRedis,
    });
  }
  // return instanceRedis
};
const getIORedis = () => clients;
const closeIORedis = () => {};
module.exports = {
  init,
  getIORedis,
  closeIORedis,
};
