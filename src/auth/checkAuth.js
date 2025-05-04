"use strict";

const { ForbiddenError } = require("../core/error.response");
const { findById } = require("../services/apiKey.service");

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "Authorization",
};

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) throw new ForbiddenError("Forbidden!");
    // check objKey
    const objKey = await findById(key);
    if (!objKey) throw new ForbiddenError("Forbidden!");
    req.objKey = objKey;
    console.error(req.objKey);
    return next();
  } catch (error) {
    next(error);
  }
};

const permission = (permission) => {
  return (req, res, next) => {
    if (!req.objKey.permissions) {
      throw new ForbiddenError("Permission denied!");
    }
    const validPermission = req.objKey.permissions.includes(permission);
    if (!validPermission) throw new ForbiddenError("Permission denied!");
    return next();
  };
};
module.exports = {
  apiKey,
  permission,
};
