"use strict";
require("dotenv").config();

const Role = require("../models/role.model");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
require("../db/init.mongodb");
const createAdmin = async () => {
  // Create admin user with admin role
  try {
    const foundRoleAdmin = await Role.findOne({
      rol_name: "admin",
    });
    if (!foundRoleAdmin) throw new Error("Admin role not found");
    const foundUser = await User.findOne({
      usr_name: "admin",
    });
    if (foundUser) throw new Error("User admin already exists");
    const passwordHash =await  bcrypt.hash("123456", 10);
    const adminUser = await User.create({
      usr_id: 0,
      usr_name: "admin",
      usr_slug: "admin",
      usr_full_name: "Lê Trọng Hiệp",
      usr_password: passwordHash,
      usr_salt: "",
      usr_email: "letronghiep213@gmail.com",
      usr_phone: "0962800116",
      usr_sex: "male",
      usr_avatar: "",
      usr_date_of_birth: "2003-01-13",
      usr_role: foundRoleAdmin._id,
      usr_status: "active",
    });
    // return adminUser;
  } catch (error) {
    console.log("có lỗi trong quá trình tạo::", error);
  }
};
createAdmin();
