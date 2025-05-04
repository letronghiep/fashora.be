"use strict";

const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "Attribute";

const COLLECTION_NAME = "attributes";
var attributeSchema = new Schema(
  {
    category_id: {
      type: [Number],
      default: [],
      required: true,
    },
    attribute_list: [
      {
        attribute_id: {
          type: Number,
          required: true,
        },
        display_name: {
          type: String,
          default: "",
        },
        children: [
          {
            value_id: {
              type: Number,
              required: true,
            },
            name: {
              type: String,
            },
            display_name: {
              type: String,
              default: "",
            },
            children: [this],
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);
module.exports = model(DOCUMENT_NAME, attributeSchema);
