"use strict";
const Inventory = require("../inventory.model");
const insertInventory = async ({
  productId,
  shopId,
  location = "unKnow",
  stock,
}) => {
  return await Inventory.create({
    inven_productId: productId,
    inven_shopId: shopId,
    inven_stock: stock,
    inven_location: location,
  });
};
const updateInventory = async ({
  productId,
  shopId,
  location = "unKnown",
  stock,
}) => {
  const inventory = {
    inven_shopId: shopId,
    inven_stock: stock,
    inven_location: location,
  };
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
const reservationInventory = async ({ productId, quantity, cartId }) => {
  const query = {
      inven_productId: productId,
      inven_stock: { $gte: quantity },
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
