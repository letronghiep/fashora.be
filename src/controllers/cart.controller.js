"use strict";
const { CREATED, SuccessResponse } = require("../core/success.response");
const {
  addToCartService,
  updateCartService,
  deleteUserCartService,
  getListUserCartService,
} = require("../services/cart.service");
const addToCart = async (req, res, next) => {
  new CREATED({
    message: "cart created",
    metadata: await addToCartService({
      userId: req.user.userId,
      product: req.body,
    }),
  }).send(res);
};

const updateCart = async (req, res, next) => {
  new SuccessResponse({
    message: "cart updated",
    metadata: await updateCartService({
      userId: req.user.userId,
      shop_order_ids: req.body,
    }),
  }).send(res);
};
const deleteCart = async (req, res, next) => {
  new SuccessResponse({
    message: "deleted products cart",
    metadata: await deleteUserCartService({
      userId: req.user.userId,
      sku_id: req.params.sku_id,
    }),
  }).send(res);
};

const getListUserCart = async (req, res, next) => {
  new SuccessResponse({
    message: "cart list",
    metadata: await getListUserCartService({
      userId: req.user.userId,
    }),
  }).send(res);
};

module.exports = {
  addToCart,
  updateCart,
  deleteCart,
  getListUserCart,
};
