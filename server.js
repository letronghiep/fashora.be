const http = require("http");
const { initSocket } = require("./src/db/init.socket");
const app = require("./src/app");
const PORT = process.env.PORT || 8080;
// const server = http.createServer(app);

// server.listen(portSocket);
// initSocket(server);
app.listen(PORT, () => {
  console.log(`Server starting with ${PORT}`);
});
