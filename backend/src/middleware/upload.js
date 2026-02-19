const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  ['.gcode', '.mf3'].includes(ext) ? cb(null, true) : cb(new Error('Only .gcode and .mf3 files allowed.'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } });

module.exports = { upload };