"use strict";
const {
  createResource,
  createRole,
  getListResource,
  getListRole,
  updateRoleService,
  getRoleService,
} = require("../services/rbac.service");
const { CREATED, SuccessResponse } = require("../core/success.response");
const newRole = async (req, res, next) => {
  new CREATED({
    message: "Created role",
    metadata: await createRole(req.body),
  }).send(res);
};

const listRole = async (req, res, next) => {
  new SuccessResponse({
    message: "List role",
    metadata: await getListRole({
      userId: 0,
      ...req.query,
    }),
  }).send(res);
};

const getRole = async(req, res, next) => {
  new SuccessResponse({
    message: "Detail role",
    metadata: await getRoleService({
      id: req.params.id
    }),
  }).send(res);
}
 
const newResource = async (req, res, next) => {
  new SuccessResponse({
    message: "Created resource",
    metadata: await createResource(req.body),
  }).send(res);
};
const listResource = async (req, res, next) => {
  new SuccessResponse({
    message: "List resource",
    metadata: await getListResource({
      userId: 0,
      ...req.query,
    }),
  }).send(res);
};
const updateRole = async (req, res, next) => {
  new SuccessResponse({
    message: "Updated role",
    metadata: await updateRoleService({
      rol_slug: req.params.slug,
      ...req.body,
    }),
  }).send(res);
};
module.exports = {
  newRole,
  listRole,
  newResource,
  listResource,
  updateRole,
  getRole,
 
};
