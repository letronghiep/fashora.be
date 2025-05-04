"use strict";

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "products";
const slugify = require("slugify");

const { model, Types, Schema } = require("mongoose");
var productSchema = new Schema(
  {
    product_id: {
      type: String,
      default: "",
      unique: true,
    },
    product_name: {
      type: String,
      required: true,
    },
    product_brand: { type: String, required: true },
    product_slug: {
      type: String,
      unique: true,
    },
    product_thumb: { type: String, required: true },
    product_images: {
      type: [String],
      default: [],
    },
    product_description: String,
    product_price: {
      type: Number,
      required: true,
    },
    product_category: {
      type: Array,
      default: [],
    },
    product_quantity: {
      type: Number,
      required: true,
    },
    product_sold: {
      type: Number,
      default: 0,
    },
    product_seller: {
      type: Number,
      default: this.product_price,
    },
    product_shop: {
      type: Types.ObjectId,
      ref: "Shop",
    },
    product_attributes: {
      type: Array,
      default: [],
    },
    product_rattingAvg: {
      type: Number,
      default: 1,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be above 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },

    product_variations: {
      type: Array,
      default: [],
    },
    product_models: {
      type: Array,
      default: [],
    },
    product_status: {
      type: String,
      enum: ["published", "draft", "blocked", "deleted"],
      default: "published",
    },
    product_favorites: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    product_views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

productSchema.index({ product_name: "text", product_description: "text" });
// productSchema.index({ product_attributes: 1 });
productSchema.index({ "product_attributes.id": 1 });
productSchema.index({ "product_attributes.value": 1 });

productSchema.index({ product_category: 1 });
productSchema.index({ product_price: 1 });
productSchema.pre("save", function (next) {
  this.product_slug = slugify(this.product_name, { lower: true });

  next();
});

module.exports = model(DOCUMENT_NAME, productSchema);
