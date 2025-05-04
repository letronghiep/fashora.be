const { Server } = require("socket.io");
const { BadRequestError } = require("../core/error.response");
// const { createAdapter } = require("@socket.io/redis-adapter");
let io;
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Địa chỉ client
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`New connection: ${socket.id}`);
    socket.on("disconnect", (reason) => {
      console.log(`Disconnect connection: ${socket.id}, reason: ${reason}`);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new BadRequestError("Socket.IO has not been initialized");
  }
  return io;
};

module.exports = {
  initSocket,
  getIO,
};
