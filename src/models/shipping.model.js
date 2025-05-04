"use strict";
const { model, Schema, Types } = require("mongoose"); // Erase if already required
const DOCUMENT_NAME = "Shipping";
const COLLECTION_NAME = "shippings";
// Declare the Schema of the Mongo model
const shippingSchema = new Schema(
  {
    user_id: {
      type: Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    district: {
      type: String,
      default: "",
    },
    ward: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    zip: {
      type: String,
      default: "",
    },
    geo_info: {
      user_adjusted: {
        type: Boolean,
        default: false,
      },
      region: {
        lat: Number,
        lng: Number,
      },
    },
    shipping_id: {
      type: String,
      required: true,
      unique: true,
    },
    is_delivery_address: {
      type: Boolean,
      default: false,
    },
    is_return_address: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = model(DOCUMENT_NAME, shippingSchema);
