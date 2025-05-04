"use strict";
const {
  createShipmentService,
  getShipmentService,
} = require("../services/shipment.service");
const { CREATED, SuccessResponse } = require("../core/success.response");
const createShipment = async (req, res, next) => {
  new CREATED({
    message: "Created shipment",
    metadata: await createShipmentService(req.body),
  }).send(res);
};
const getShipment = async (req, res, next) => {
  new SuccessResponse({
    message: "Get shipment",
    metadata: await getShipmentService(),
  }).send(res);
};
module.exports = {
  createShipment,
  getShipment,
};
