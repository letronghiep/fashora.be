"use strict";
const { model, Schema, Types } = require("mongoose");
const { default: slugify } = require("slugify");

const DOCUMENT_NAME = "Category";

const COLLECTION_NAME = "categories";
var categorySchema = new Schema(
  {
    category_id: {
      type: Number,
      default: 0,
      unique: true,
      required: true,
    },
    category_name: {
      type: String,
      default: "",
    },
    category_thumb: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      default: "",
    },
    category_parentId: {
      type: [Number],
      default: [],
    },
    category_status: {
      type: String,
      enum: ["pending", "active", "inactive"],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

categorySchema.index({ category_name: "text" });
categorySchema.index({ category_id: "text" });
categorySchema.index({ category_parentId: "text" });

categorySchema.pre("save", function (next) {
  this.slug = slugify(this.category_name, { lower: true });

  next();
});

module.exports = model(DOCUMENT_NAME, categorySchema);
