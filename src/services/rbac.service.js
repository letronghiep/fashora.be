"use strict";
const Resource = require("../models/resource.model");
const User = require("../models/user.model");
const Role = require("../models/role.model");
const { BadRequestError } = require("../core/error.response");
const { Types } = require("mongoose");
const createResource = async ({ src_name, src_slug, src_description }) => {
  // Create resource
  try {
    // 1. check exists resource
    const foundResource = await Resource.findOne({ src_name });
    if (foundResource) throw new Error("Resource already exists");
    // 2. create resource
    const resource = await Resource.create({
      src_name,
      src_slug,
      src_description,
    });
    return resource;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};
const getListResource = async ({
  limit = 50,
  userId,
  skip = 0,
  search = "",
}) => {
  try {
    // 1. check admin
    // const isAdmin = await User.findOne({
    //   usr_id: userId,
    // }).lean();
    // if (!isAdmin) throw new Error("You are not admin");
    // 2. get list resource
    const resources = await Resource.aggregate([
      {
        $project: {
          _id: 0,
          name: "$src_name",
          slug: "$src_slug",
          description: "$src_description",
          resourceId: "$_id",
          createdAt: "$createdAt",
        },
        // $skip: skip,
        // $limit: limit,
        // $match: {
        //   $text: { $search: search },
        // },
      },
    ]);
    return resources;
  } catch (error) {
    return [];
  }
};
const createRole = async ({
  rol_name,
  rol_slug,
  rol_status = "pending",
  rol_description = "",
  rol_grants = [],
}) => {
  try {
    // check role exists
    const foundRole = await Role.findOne({
      rol_slug,
    }).lean();
    if (foundRole) throw new BadRequestError("Role đã tồn tại");
    // create role
    const role = await Role.create({
      rol_name,
      rol_slug,
      rol_description,
      rol_status,
      rol_grants,
    });
    return role;
  } catch (error) {
    throw error;
  }
};
const getListRole = async ({ userId, limit = 30, skip = 0, search = "" }) => {
  try {
    // check admin
    // const isAdmin = await User.findOne({
    //   usr_id: userId,
    // }).lean();
    // if (!isAdmin) throw new Error("Bạn không phải quản trị");
    // get list role
    const roles = Role.aggregate([
      {
        $unwind: "$rol_grants",
      },
      {
        $lookup: {
          from: "resources",
          localField: "rol_grants.resource",
          foreignField: "_id",
          as: "resource",
        },
      },
      {
        $unwind: "$resource",
      },
      {
        $project: {
          role: "$rol_name",
          resource: "$resource.src_name",
          action: "$rol_grants.actions",
          attributes: "$rol_grants.attributes",
        },
      },
      {
        $unwind: "$action",
      },
      {
        $project: {
          _id: 0,
          role: 1,
          resource: 1,
          action: "$action",
          attributes: 1,
        },
      },
    ]);
    return roles;
  } catch (error) {
    throw error;
  }
};
// get single role

const getRoleService = async ({ id }) => {
  try {
    // check role exists
    const foundRole = await Role.findById({
      _id: id,
    }).lean();
    if (!foundRole) throw new BadRequestError("Role không tồn tại");
    // get role
    return foundRole;
  } catch (error) {
    throw error;
  }
};
// update role
const updateRoleService = async ({
  rol_slug,
  rol_name,
  rol_description,
  rol_status,
  rol_grants,
}) => {
  try {
    // check role exists
    const foundRole = await Role.findOne({
      rol_slug,
    }).lean();
    if (!foundRole) throw new BadRequestError("Role không tồn tại");
    // update role
    const role = await Role.findByIdAndUpdate(
      foundRole._id,
      {
        rol_name,
        rol_slug,
        rol_description,
        rol_status,
        rol_grants,
      },
      { new: true }
    ).lean();
    return role;
  } catch (error) {
    throw error;
  }
};
module.exports = {
  createResource,
  createRole,
  getListResource,
  getListRole,
  updateRoleService,
  getRoleService,
};
