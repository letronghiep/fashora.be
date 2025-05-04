"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const {
  createCommentService,
  getCommentByParentIdService,
  deleteCommentService,
} = require("../services/comment.service");

const createComment = async (req, res, next) => {
  new CREATED({
    message: "message was created",
    metadata: await createCommentService({
      userId: req.user.userId,
      comment_rating: req.body.comment_rating,
      parentCommentId: req.body.parentCommentId,
      productId: req.body.productId,
      comment_content: req.body.comment_content,
    }),
  }).send(res);
};

const getCommentByParentId = async (req, res, next) => {
  new SuccessResponse({
    message: "comments",
    metadata: await getCommentByParentIdService({
      parentId: req.query.parent_id,
      productId: req.query.productId,
      limit: req.query.limit,
      page: req.query.page,
    }),
  }).send(res);
};

const deleteComment = async (req, res, next) => {
  new SuccessResponse({
    message: "comment deleted",
    metadata: await deleteCommentService(req.body),
  }).send(res);
};
module.exports = {
  createComment,
  getCommentByParentId,
  deleteComment,
};
