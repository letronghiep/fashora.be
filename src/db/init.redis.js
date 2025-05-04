"use strict";
const redis = require("redis");
const { RedisErrorResponse } = require("../core/error.response");

const client = {};
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
    console.log(`connectionRedis - Connection status: connected`);
    clearTimeout(connectionTimeout);
  });
  connectionRedis.on(statusConnectRedis.END, () => {
    console.log(`connectionRedis - Connection status: disconnected`);
    // retry connect
    handleTimeoutError();
  });
  connectionRedis.on(statusConnectRedis.RECONNECT, () => {
    console.log(`connectionRedis - Connection status: reconnecting`);
    clearTimeout(connectionTimeout);
  });
  connectionRedis.on(statusConnectRedis.ERROR, (error) => {
    console.log(`connectionRedis - Connection status: error ${error}`);
    // retry connect
    handleTimeoutError();
  });
};

const initRedis = () => {
  const instanceRedis = redis.createClient({
    password: '*******',
    socket: {
        host: 'redis-11680.c252.ap-southeast-1-1.ec2.redns.redis-cloud.com',
        port: 11680
    }
});
  client.instanceConnect = instanceRedis;
  handleEventConnection({
    connectionRedis: instanceRedis,
  });
  // return instanceRedis
};
const getRedis = () => client;
const closeRedis = () => {};
module.exports = {
  initRedis,
  getRedis,
  closeRedis,
};
