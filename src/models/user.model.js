"use strict";
const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "users";
const { model, Schema, Types } = require("mongoose");
const slugify = require("slugify");

var userSchema = new Schema(
  {
    usr_id: {
      type: Number,
      required: true,
      unique: true,
    },
    usr_name: {
      type: String,
      unique: true,
      default: "",
    },
    usr_slug: {
      type: String,
    },
    usr_full_name: {
      type: String,
      default: "",
    },
    usr_address: {
      type: String,
      default: "",
    },
    usr_city: {
      type: String,
      default: "",
    },
    usr_district: {
      type: String,
      default: "",
    },
    usr_ward: {
      type: String,
      default: "",
    },
    usr_password: {
      type: String,
      default: "",
    },
    usr_salt: {
      type: String,
      default: "",
    }, // ma bao mat
    usr_email: {
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
    usr_date_of_birth: {
      type: Date,
      default: null,
    },
    usr_role: {
      type: Types.ObjectId,
      ref: "Role",
    },
    usr_status: {
      type: String,
      default: "pending",
      enum: ["pending", "active", "block"],
    },
    usr_wishList: [
      {
        type: Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

userSchema.index({ usr_name: "text" });

userSchema.pre("save", function (next) {
  this.usr_slug = slugify(this.usr_name, { lower: true });

  next();
});

module.exports = model(DOCUMENT_NAME, userSchema);
