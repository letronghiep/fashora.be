'use strict'
const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "KeyToken";
const COLLECTION_NAME = "keyTokens";

// Declare the Schema of the Mongo model

var keyTokenSchema = new Schema(
  {
        user: {
            type: Types.ObjectId,
            required: true,
            ref: 'User'
        },
        publicKey: {
            type: String,
            required: true
        },
        privateKey: {
            type: String,
            required: true
        },
        refreshToken: {
            type: String,
            required: true
        },
        refreshTokenUsed: {
            type: Array,
            default: []
        }


  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = model(DOCUMENT_NAME, keyTokenSchema);
