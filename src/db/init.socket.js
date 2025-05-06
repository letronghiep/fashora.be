let io;

const initSocket = (server) => {
  try {
    io = require("socket.io")(server, {
      cors: {
        origin: "*",  // Bạn có thể thay "*" bằng domain frontend của bạn nếu cần hạn chế
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],  // Nếu cần
        credentials: true,
      },
      transports: ["websocket", "polling"],  // Đảm bảo bạn bao gồm "websocket" và "polling"
    });

    io.on("connection", (socket) => {
      console.log("New client connected:", socket.id);
    });

    console.log("✅ Socket.IO initialized");
  } catch (error) {
    console.error("Socket.IO initialization error:", error);
    throw error;
  }
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }
  return io;
};

module.exports = { initSocket, getIO };
