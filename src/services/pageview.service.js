"use strict";
const PageView = require("../models/pageview.model");
const { BadRequestError } = require("../core/error.response");
const createTrackPageViewService = async ({ page, user_id }) => {
  try {
    if (!page || !user_id) {
      throw new BadRequestError("Page và mã người dùng không được trống");
    }
    const pageview = await PageView.findOne({ page });
    if (pageview) {
      pageview.views += 1;
      if (!pageview.visitors.includes(user_id)) {
        pageview.uniqueVisitor += 1;
        pageview.visitors.push(user_id);
      }
      pageview.lastUpdated = new Date();
      await pageview.save();
    } else {
      const newPageView = new PageView({
        page,
        views: 1,
        uniqueVisitor: 1,
        visitors: [user_id],
        lastUpdated: new Date(),
      });
      await newPageView.save();
    }
  } catch (error) {
    console.error(error);
  }
};
const getTrackPageViewService = async () => {
  try {
    const pageviews = await PageView.find({});
    return pageviews;
  } catch (error) {
    console.error(error);
  }
};
module.exports = {
  createTrackPageViewService,
  getTrackPageViewService,
};
