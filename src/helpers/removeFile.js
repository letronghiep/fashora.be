const fs = require('fs').promises;
const path = require('node:path');

module.exports = {
  removeFileFromDirectory: async (directory) => {
    try {
      const files = await fs.readdir(directory, { withFileTypes: true });
      for (const file of files) {
        const filePath = path.join(directory, file.name);
        if (file.isDirectory()) {
          await module.exports.removeFileFromDirectory(filePath);
        } else {
          await fs.unlink(filePath);
        }
      }
    } catch (err) {
      console.error(`Lỗi khi xóa file trong thư mục '${directory}':`, err.message);
      throw err;
    }
  },
};
