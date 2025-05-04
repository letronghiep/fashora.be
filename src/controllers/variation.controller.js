"use strict";
const { CREATED, SuccessResponse } = require("../core/success.response");
const {
  createVariationService,
  getVariationsByProductIdService,
  updateVariationService,
  deleteVariationService,
  getVariationsService,
} = require("../services/variations.service");

const createVariation = async (req, res, next) => {
  new CREATED({
    message: "Variation created",
    metadata: await createVariationService(req.body),
  }).send(res);
};

const getVariations = async (req, res, next) => {
  new SuccessResponse({
    message: "List variations",
    metadata: await getVariationsService({
      category_id: req.query.category_id,
    }),
  }).send(res);
};

const updateVariation = async (req, res, next) => {
  new SuccessResponse({
    message: "Update variation",
    metadata: await updateVariationService(req.params, req.body),
  }).send(res);
};

const deleteVariation = async (req, res, next) => {
  new SuccessResponse({
    message: "Delete variation",
    metadata: await deleteVariationService(req.params),
  }).send(res);
};

module.exports = {
  createVariation,
  getVariations,
  updateVariation,
  deleteVariation,
};
