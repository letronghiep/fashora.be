"use strict";
const DOCUMENT_NAME = "Shop";
const COLLECTION_NAME = "shops";
const { model, Schema, Types } = require("mongoose");
const slugify = require('slugify')
var shopSchema = new Schema(
  {
    usr_id: {
      type: Number,
      required: true,
      unique: true,
    },
    usr_full_name: {
      // display name
      type: String,
      default: "",
    },
    usr_slug: {
      type: String,
      default: "",
    },
    usr_name: {
      // login name
      type: String,
      unique: true,
      default: "",
    },
    usr_password: {
      type: String,
      default: "",
    },
    usr_email: {
      type: String,
      default: "",
    },
    received_address: {
      type: String,
      default: "",
    },
    sent_address: {
      type: String,
      default: "",
    },
    usr_phone: {
      type: String,
      default: "",
    },
    usr_sex: {
      type: String,
      default: "",
    },
    usr_avatar: {
      type: String,
      default: "",
    },
    usr_role: {
      type: Types.ObjectId,
      ref: "Role",
    },
    usr_date_of_birth: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "active", "block"],
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

shopSchema.index({ name: "text" });
shopSchema.pre("save", function (next) {
  this.usr_slug = slugify(this.usr_name, { lower: true });

  next();
});
module.exports = model(DOCUMENT_NAME, shopSchema);
