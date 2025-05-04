"use strict";
"use strict";
const { model, Schema, Types } = require("mongoose");
const { default: slugify } = require("slugify");

const DOCUMENT_NAME = "Shipment";
const COLLECTION_NAME = "shipments";

// Declare the Schema of the Mongo model

var shipmentSchema = new Schema(
  {
    shipment_id: {
      type: String,
      required: true,
    },
    shipment_name: {
      type: String,
      required: true,
    },
    shipment_slug: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);
shipmentSchema.pre("save", function (next) {
  this.shipment_slug = slugify(this.shipment_name, {
    lower: true,
    replacement: "_",
  });

  next();
});
//Export the model
module.exports = model(DOCUMENT_NAME, shipmentSchema);
