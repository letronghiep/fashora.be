"use strict";
const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "Notification";
const COLLECTION_NAME = "notifications";

// Declare the Schema of the Mongo model

var notifySchema = new Schema(
  {
    notify_type: {
      type: String,
      required: true,
    },
    notify_senderId: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
    notify_receiverId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    notify_content: {
      type: String,
      required: true,
    },
    notify_isRead: {
      type: Boolean,
      default: false,
    },
    notify_options: {
      type: Object,
      default: {},
    },
  },

  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = model(DOCUMENT_NAME, notifySchema);
