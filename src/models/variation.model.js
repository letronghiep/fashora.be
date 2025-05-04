"use strict";

const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "Variation";

const COLLECTION_NAME = "variations";
var variationSchema = new Schema(
  {
    category_id: {
      type: [Number],
      default: [],
      required: true,
    },
    tier_variation_list: [
      {
        variation_id: {
          type: String,
          required: true,
          unique: true,
        },
        display_name: {
          type: String,
          default: "",
        },
        group_list: [
          {
            group_id: {
              type: String,
              required: true,
            },
            group_name: {
              type: String,
              required: true,
            },
            value_list: [
              {
                value_id: {
                  type: Number,
                  required: true,
                },
                value_name: {
                  type: String,
                  required: true,
                },
              },
            ],
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

//Export the model
module.exports = model(DOCUMENT_NAME, variationSchema);
