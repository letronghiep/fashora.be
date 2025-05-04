"use strict";

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Brand";

const COLLECTION_NAME = "brands";
var brandSchema = new Schema(
  {
    category_id: {
      type: [Number],
      default: [],
      required: true,
    },
    brand_list: [
      {
        brand_id: {
          type: String,
          required: true,
          unique: true,
        },
        display_name: {
          type: String,
          default: "",
        },
      },
    ],
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);
module.exports = model(DOCUMENT_NAME, brandSchema);
