"use strict";

const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "Cart";

const COLLECTION_NAME = "carts";
var cartSchema = new Schema(
  {
    cart_state: {
      type: String,
      required: true,
      enum: ["active", "completed", "failed", "pending"],
      default: "active",
    },
    cart_products: {
      type: Array,
      required: true,
      default: [],
    },
    cart_count_product: {
      type: Number,
      default: 0,
    },
    cart_userId: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
    cart_total_price: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);
module.exports = model(DOCUMENT_NAME, cartSchema);

cartSchema.pre("save", function () {
  this.cart_count_product = this.cart_products.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
});

cartSchema.pre("save", function () {
  this.cart_total_price = this.cart_products.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
});
