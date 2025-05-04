"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const {
  createAttributeService,
  getAttributesByCategoryIdService,
} = require("../services/attributes.service");

const createAttribute = async (req, res, next) => {
  new CREATED({
    message: "Attribute created",
    metadata: await createAttributeService(req.body),
  }).send(res);
};

const getAttributes = async (req, res, next) => {
  new SuccessResponse({
    message: "List attributes",
    metadata: await getAttributesByCategoryIdService({
      category_id: req.query.category_id || null,
    }),
  }).send(res);
};

module.exports = {
  createAttribute,
  getAttributes,
};
