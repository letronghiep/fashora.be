"use strict";

const { getIORedis } = require("../../db/init.ioredis");
const redisCache = getIORedis().instanceConnect;

const setCacheIO = async ({ key, value }) => {
  if (!redisCache) {
    throw new Error("Redis has not been initialized");
  }
  try {
    return await redisCache.set(key, value);
  } catch (error) {
    throw new Error(`${error.message}`);
  }
};

const setCacheIOExpiration = async ({ key, value, expirationInSecond }) => {
  if (!redisCache) {
    throw new Error("Redis has not been initialized");
  }
  try {
    return await redisCache.set(key, value, "EX", expirationInSecond);
  } catch (error) {
    throw new Error(`${error.message}`);
  }
};

const getCacheIO = async ({ key }) => {
  if (!redisCache) {
    throw new Error("Redis has not been initialized");
  }
  try {
    console.log(key);
    return await redisCache.get(key);
  } catch (error) {
    throw new Error(`${error.message}`);
  }
};
const getAllCache = async ({ key }) => {
  const keys = [];
  let cursor = "0"; // Cursor luôn là string

  try {
    do {
      // Gọi SCAN với MATCH và COUNT
      const [nextCursor, foundKeys] = await redisCache.scan(
        cursor,
        "MATCH",
        key
      );
      cursor = nextCursor; // Cập nhật cursor
      keys.push(...foundKeys); // Lưu các key tìm được
    } while (cursor !== "0"); // Tiếp tục đến khi cursor trở về "0"

    return keys;
  } catch (error) {
    console.error("Error during SCAN:", error);
    return [];
  }
};

const clearCacheIO = async ({ key }) => {
  if (!redisCache) {
    throw new Error("Redis has not been initialized");
  }
  try {
    if (!key) return;
    const keys = await getCacheIO({ key: key });
    if (keys && keys.length > 0) {
      await redisCache.del(keys);
    }
  } catch (error) {
    throw new Error(`${error.message}`);
  }
};
const clearCachePattern = async (pattern) => {
  if (!redisCache) {
    throw new Error("Redis has not been initialized");
  }
  console.log(pattern);
  try {
    const keys = await redisCache.keys(pattern);
    if (keys && keys.length > 0) {
      await redisCache.del(keys);
    }
  } catch (error) {
    throw new Error(`${error.message}`);
  }
};
module.exports = {
  setCacheIO,
  setCacheIOExpiration,
  getCacheIO,
  clearCacheIO,
  getAllCache,
  clearCachePattern,
};
