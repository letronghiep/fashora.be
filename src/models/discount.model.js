"use strict";

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "discounts";
const { Schema, model, Types } = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var discountSchema = new Schema(
  {
    discount_name: {
      type: String,
      required: true,
    },
    discount_description: {
      type: String,
      default: "",
    },
    discount_type: {
      type: String,
      enum: ["percentage", "fixed_amount"],
      default: "fixed_amount",
    },
    discount_value: {
      type: Number,
      require: true,
    },
    discount_code: {
      type: String,
      required: true,
      unique: true,
    },
    discount_start_date: {
      type: Date,
      required: true,
    },
    discount_end_date: {
      type: Date,
      required: true,
    },
    discount_max_uses: {
      type: Number,
      required: true,
    },
    discount_uses_count: {
      type: Number,
      default: 0,
    },
    discount_users_used: {
      type: Array,
      default: [],
    },
    discount_max_uses_per_user: {
      type: Number,
      default: 0,
    }, // so luong cho phep toi da su dung cua moi user
    discount_min_order_value: {
      type: Number,
      default: 0,
    }, // gia tri don hang toi thieu duoc ap dung
    discount_max_value: {
      type: Number,
      default: 0,
    }, // gia tri don hang toi da
    discount_shopId: {
      type: Types.ObjectId,
      required: true,
      ref: "Shop",
    },
    discount_is_active: {
      type: Boolean,
      default: true,
    },
    discount_applies_to: {
      type: String,
      required: true,
      enum: ["all", "specific"],
    },
    discount_product_ids: {
      type: Array,
      default: [],
    },
    discount_status: {
      type: String,
      default: "pending",
      enum: ["pending", "active", "block", "expired"],
    },
  },

  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, discountSchema);
