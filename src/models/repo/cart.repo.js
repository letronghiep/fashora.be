"use strict";
const { Types } = require("mongoose");
const Cart = require("../cart.model");
const findCartById = async ({ cartId }) => {
  return await Cart.findOne({
    _id: new Types.ObjectId(cartId),
    cart_state: "active",
  }).lean();
};
module.exports = {
  findCartById,
};
