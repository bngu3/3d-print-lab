const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  ext === '.stl' ? cb(null, true) : cb(new Error('Only .stl files allowed.'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } });

module.exports = { upload };