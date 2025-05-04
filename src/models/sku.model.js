"use strict";

const DOCUMENT_NAME = "Sku";
const COLLECTION_NAME = "skus";

const { model, Types, Schema } = require("mongoose");
const { default: slugify } = require("slugify");
var skuSchema = new Schema(
  {
    sku_id: {
      type: String,
      required: true,
      unique: true,
    },
    sku_name: {
      type: String,
      required: true,
    },
    sku_tier_idx: {
      type: Array,
      default: [],
    },
    sku_default: {
      type: Boolean,
      default: false,
    },
    sku_slug: {
      type: String,
      default: "",
    },
    sku_sort: {
      type: Number,
      default: 0,
    },
    sku_price: {
      type: String,
      required: true,
    },
    sku_price_sale: {
      type: String,
      default: "0",
    },
    sku_stock: {
      type: Number,
      default: 0,
    },
    product_id: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku_status: {
      type: String,
      enum: ["published", "draft", "blocked", "deleted"],
      default: "published",
    },
  },
  {
    timestamp: true,
    collection: COLLECTION_NAME,
  }
);
skuSchema.pre("save", function (next) {
  this.sku_slug = slugify(this.sku_name, { lower: true });

  next();
});
module.exports = model(DOCUMENT_NAME, skuSchema);
