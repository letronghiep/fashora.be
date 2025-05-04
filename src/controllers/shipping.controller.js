"use strict";
const { SuccessResponse, CREATED } = require("../core/success.response");
const {
  updateShippingService,
  removeShippingService,
  getListShippingByUser,
  createShippingByUser,
  getShippingDetailService,
  updateDefaultShippingService,
} = require("../services/shipping.service");
const getListShipping = async (req, res, next) => {
  const address = await getListShippingByUser({
    user_id: req.user.userId,
    ...req.query,
  });
  new SuccessResponse({
    message: "Get list shipping success",
    metadata: await address,
  }).send(res);
};
const getShippingDetail = async (req, res, next) => {
  new SuccessResponse({
    message: "Get shipping detail success",
    metadata: await getShippingDetailService({
      user_id: req.user.userId,
      shipping_id: req.params.shipping_id,
    }),
  }).send(res);
};
const createShipping = async (req, res, next) => {
  new CREATED({
    message: "Create shipping success",
    metadata: await createShippingByUser({
      user_id: req.user.userId,
      ...req.body,
    }),
  }).send(res);
};
const updateShipping = async (req, res, next) => {
  new SuccessResponse({
    message: "Update shipping information successfully",
    metadata: await updateShippingService({
      user_id: req.user.userId,
      shipping_id: req.params.shipping_id,
      ...req.body,
    }),
  }).send(res);
};
const removeShipping = async (req, res, next) => {
  new SuccessResponse({
    message: "Remove shipping information successfully",
    metadata: await removeShippingService({
      user_id: req.user.userId,
      shipping_id: req.params.shipping_id,
    }),
  }).send(res);
};
const updateDefaultShipping = async (req, res, next) => {
  new SuccessResponse({
    message: "Update default shipping information successfully",
    metadata: await updateDefaultShippingService({
      user_id: req.user.userId,
      shipping_id: req.params.shipping_id,
    }),
  }).send(res);
}
module.exports = {
  getListShipping,
  getShippingDetail,
  createShipping,
  updateShipping,
  removeShipping,
  updateDefaultShipping
};
