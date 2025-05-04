"use strict";
const DOCUMENT_NAME = "ApiKey";
const COLLECTION_NAME = "api_keys";

const { model, Schema } = require("mongoose");
var apiKeySchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      required: true,
      enum: ["0000", "1111", "2222"], // ['full_control', 'change' , 'read_only']
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, apiKeySchema);
