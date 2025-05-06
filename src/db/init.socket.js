// const { Server } = require("socket.io");
// const { BadRequestError } = require("../core/error.response");
// // const { createAdapter } = require("@socket.io/redis-adapter");
// let io;
// const initSocket = (server) => {
//   io = new Server(server, {
//     cors: {
//       origin: "*", // Địa chỉ client
//       methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//       credentials: true,
//     },
//   });

//   io.on("connection", (socket) => {
//     console.log(`New connection: ${socket.id}`);
//     socket.on("disconnect", (reason) => {
//       console.log(`Disconnect connection: ${socket.id}, reason: ${reason}`);
//     });
//   });
// };

// const getIO = () => {
//   if (!io) {
//     throw new BadRequestError("Socket.IO has not been initialized");
//   }
//   return io;
// };

// module.exports = {
//   initSocket,
//   getIO,
// };
let io;

const initSocket = (server) => {
  try {
    io = require("socket.io")(server, {
      cors: {
        origin: "*",  // Đảm bảo bạn cho phép nguồn chính xác nếu có cần hạn chế.
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("New client connected:", socket.id);
    });

    console.log("✅ Socket.IO initialized");
  } catch (error) {
    console.error("Socket.IO initialization error:", error);
    throw error;  // Ném lại lỗi nếu không thể khởi tạo
  }
};

// Lấy instance của Socket.IO
const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }
  return io;
};

module.exports = { initSocket, getIO };
