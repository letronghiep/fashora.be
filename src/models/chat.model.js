"use strict";
const { model, Schema, Types } = require("mongoose");
const { default: slugify } = require("slugify");

const DOCUMENT_NAME = "Chat";

const COLLECTION_NAME = "chats";
var messageSchema = new Schema( 
    {
        sender: {
            type: String,
            required: true,
        },
        content: {
            type: [String],
            required: true,
        },
        isAI: {
            type: Boolean,
            default: false,
        },
        isUser: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);
var chatSchema = new Schema(
  {
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    messages: {
        type: [messageSchema],
        default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, chatSchema);
