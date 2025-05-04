"use strict";

const { SuccessResponse, CREATED } = require("../core/success.response");
const {
  createTrackPageViewService,
  getTrackPageViewService,
} = require("../services/pageview.service");

const createTrackPageView = async (req, res, next) => {
  new CREATED({
    message: "create track page view",
    metadata: await createTrackPageViewService(req.body),
  }).send(res);
};

const getTrackPageView = async (req, res, next) => {
  new SuccessResponse({
    message: "get track page view",
    metadata: await getTrackPageViewService(req.body),
  }).send(res);
};

module.exports = {
  createTrackPageView,
  getTrackPageView,
};
