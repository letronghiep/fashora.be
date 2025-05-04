const app = require("./src/app");
// const server = createServer(app);
const PORT = process.env.PORT || 8080;

// server.listen(portSocket);

app.listen(PORT, () => {
  console.log(`Server starting with ${PORT}`);
});
