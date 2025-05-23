"use strict";
const Redis = require("ioredis");

class RedisPubsubService {
  constructor() {
    this.subscriber = new Redis(process.env.REDIS_URL); // Correct instantiation
    this.publisher = new Redis(process.env.REDIS_URL);
  }
  publish(channel, message) {
    return new Promise((resolve, reject) => {
      this.publisher.publish(channel, message, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }
  subscribe(channel, callback) {
    this.subscriber.subscribe(channel);
    this.subscriber.on("message", (subscriberChannel, message) => {
      if (channel === subscriberChannel) {
        callback(channel, message);
      }
    });
  }
}

module.exports = RedisPubsubService;
