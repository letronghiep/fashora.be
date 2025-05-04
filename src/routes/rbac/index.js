"use strict";
const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const {
  newRole,
  newResource,
  listResource,
  listRole,
  updateRole,
  getRole,
} = require("../../controllers/rbac.controller");
const { getListResource, getListRole } = require("../../services/rbac.service");
const router = express.Router();
router.post("/role", asyncHandler(newRole));
router.get("/roles", asyncHandler(listRole));
router.get('/role/:id', asyncHandler(getRole))
router.patch("/role/:slug", asyncHandler(updateRole));

router.post("/resource", asyncHandler(newResource));
router.get("/resources", asyncHandler(listResource));
module.exports = router;
