"use strict";
"use strict";

const express = require("express");
const router = express.Router();

const { asyncHandler } = require("../../helpers/asyncHandler");
const { authentication } = require("../../middlewares/authentication");
const {
  createComment,
  getCommentByParentId,
  deleteComment,
} = require("../../controllers/comment.controller");
router.get("", asyncHandler(getCommentByParentId));
router.use(authentication);
router.post("", asyncHandler(createComment));
router.delete("", asyncHandler(deleteComment));
module.exports = router;
