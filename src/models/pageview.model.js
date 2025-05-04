"use strict";

const DOCUMENT_NAME = "PageView";
const COLLECTION_NAME = "pageviews";

const { model, Types, Schema } = require("mongoose");
var pageViewSchema = new Schema(
  {
    page: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    uniqueVisitor: {
      type: Number,
      default: 0,
    },
    visitors: {
      type: [String],
      default: [],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamp: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, pageViewSchema);
