const multer = require('multer');
const path = require('path');

// Memory storage keeps file buffer in RAM so it can be uploaded directly to Supabase Storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Hanya file gambar (jpg, jpeg, png, webp, gif) yang diperbolehkan!'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB Limit
  fileFilter: fileFilter
});

module.exports = upload;
