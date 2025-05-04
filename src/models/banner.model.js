"use strict";
const { model, Schema, Types } = require("mongoose");
const DOCUMENT_NAME = "Banner";
const COLLECTION_NAME = "banners";
var bannerSchema = new Schema(
  {
    id: {
      type: String,
      default: "",
      unique: true,
    },
    title: {
      type: String,
      default: "",
    },
    thumb: {
      type: String,
      default: "",
    },
    linkTo: {
      type: String,
      default: "",
      unique: true,
    },
    isActive: { type: Boolean, default: true }, // Trạng thái banner
    startDate: { type: Date }, // Ngày bắt đầu hiển thị
    endDate: { type: Date }, // Ngày kết thúc (nếu có)
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);
module.exports = model(DOCUMENT_NAME, bannerSchema);
