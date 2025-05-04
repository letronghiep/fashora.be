"use strict";

const Inventory = require("../models/inventory.model");

const { getProductById } = require("../models/repo/product.repo");

const { NotFoundError } = require("../core/error.response");

const addStockToInventory = async ({
  stock,
  productId,
  shopId,
  location = "unKnow",
}) => {
  const product = await getProductById(productId);
  if (!product) throw new NotFoundError("Không tìm thấy sản phẩm");
  // Add your code here to update inventory
  const query = {
      inven_shopId: shopId,
      inven_productId: productId,
    },
    update = {
      $inc: { inven_stock: stock },
      $set: { inven_location: location },
    },
    options = {
      upsert: true,
      new: true,
    };
  return await Inventory.findOneAndUpdate(query, update, options);
};

module.exports = {
  addStockToInventory,
};
