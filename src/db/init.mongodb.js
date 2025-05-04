"use strict";
const mongoose = require("mongoose");
const {
  db: { host, port, name, password },
} = require("../configs/config.mongodb");
// const connectString = `mongodb+srv://${port}:${password}@cluster09279.0xtxlqi.mongodb.net/${name}`;
const connectString = `mongodb://${host}:${port}/${name}`;
const { countConnect } = require("../helpers/check.connect");

class Database {
  constructor() {
    this.connect();
  }

  connect(type = "mongodb") {
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }
    mongoose
      .connect(connectString)
      .then((_) => {
        console.log("Connected Mongodb Success", countConnect());
      })
      .catch((err) => console.log("Error connect::", err));
  }
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}
const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;
