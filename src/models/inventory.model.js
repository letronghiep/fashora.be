"use strict";
const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "inventories";
const { Schema, model, Types } = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var inventorySchema = new Schema(
  {
    inven_productId: {
      type: Types.ObjectId,
      ref: "Product",
    },
    inven_location: {
      type: String,
      default: "unKnow",
    },
    inven_stock: {
      type: Number,
      required: true,
    },
    inven_shopId: {
      type: Types.ObjectId,
      ref: "Shop",
    },
    inven_reservations: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = model(DOCUMENT_NAME, inventorySchema);
