const multer = require('multer');

// Cấu hình multer để lưu trữ ảnh trong bộ nhớ
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = upload;
