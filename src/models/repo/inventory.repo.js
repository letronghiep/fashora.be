"use strict";
const Inventory = require("../inventory.model");
const insertInventory = async ({
  productId,
  shopId,
  location = "unKnow",
  stock,
  skuId,
}) => {
  return await Inventory.create({
    inven_productId: productId,
    inven_shopId: shopId,
    inven_stock: stock,
    inven_location: location,
    inven_skuId: skuId,
  });
};
const updateInventory = async ({
  productId,
  shopId,
  location = "unKnown",
  stock,
  skuId,
}) => {
  const inventory = {
    inven_shopId: shopId,
    inven_stock: stock,
    inven_location: location,
  };
  if (skuId) {
    inventory.inven_skuId = skuId;
  }
  return await Inventory.findOneAndUpdate(
    {
      inven_productId: productId,
      inven_shopId: shopId,
    },
    inventory,
    {
      upsert: true,
    }
  );
  
};
const reservationInventory = async ({ productId, quantity, cartId, skuId }) => {
  const query = {
      inven_productId: productId,
      inven_stock: { $gte: quantity },
      inven_skuId: skuId,
    },
    updateSet = {
      $inc: { inven_stock: -quantity },
      $push: {
        inven_reservations: {
          quantity,
          cartId,
          createOn: new Date(),
        },
      },
    },
    options = {
      upsert: true,
      new: true,
    };
  return await Inventory.updateOne(query, updateSet, options);
};
module.exports = {
  insertInventory,
  reservationInventory,
  updateInventory,
};
