"use strict";
const { model, Schema, Types } = require("mongoose");
const DOCUMENT_NAME = "FlashSale";
const COLLECTION_NAME = "flash_sales";
var flashSalesSchema = new Schema(
  {
    id: {
      type: String,
      default: "",
      unique: true,
    },
    name: {
      type: String,
      default: "",
    },
    thumb: {
      type: String,
      default: "",
    },
    start_time: {
      type: Date,
      required: true,
    },
    end_time: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["ongoing", "scheduled", "ended"],
      default: "ongoing",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    products: {
      type: Array,
      default: [],
    },
    /* 
        products: [
            {
                "product_id": "p_001",
                "original_price": 500000,
                "sale_price": 300000,
                "stock": 100,
                "sold": 0,
                "limit_quantity": 10
            }
        ]
    
    */
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);
module.exports = model(DOCUMENT_NAME, flashSalesSchema);
