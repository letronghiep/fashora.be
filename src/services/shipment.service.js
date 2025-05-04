"use strict";

const Shipment = require("../models/shipment.model");
const { randomString } = require("../utils");

/**
 * Create a new shipment
 *
 * @param {object} shipment - The shipment object
 *
 * @returns {object} - The created shipment
 **/
const createShipmentService = async ({ shipment_name }) => {
  const shipment = await Shipment.create({
    shipment_id: randomString(),
    shipment_name,
  });
  return shipment;
};
const getShipmentService = async () => {
  const shipment = await Shipment.find({});
  return shipment;
};
module.exports = {
  createShipmentService,
  getShipmentService,
};
