"use strict";
const DOCUMENT_NAME = "InventoryTransaction";
const COLLECTION_NAME = "inventory_transactions";
const { Schema, model, Types } = require("mongoose");

// Declare the Schema of the Mongo model
var inventoryTransactionSchema = new Schema(
  {
    transaction_productId: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
    transaction_skuId: {
      type: String,
      required: true,
    },
    transaction_type: {
      type: String,
      required: true,
      enum: ["import", "sold", "created"], // nhap kho, ban hang, tao san pham
    },
    transaction_quantity: {
      type: Number,
      required: true,
    },
    transaction_date: {
      type: Date,
      default: Date.now,
    },
    transaction_shopId: {
      type: Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    transaction_userId: {
      type: Types.ObjectId,
      ref: "User",
    },
    transaction_note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

// Export the model
module.exports = model(DOCUMENT_NAME, inventoryTransactionSchema);
