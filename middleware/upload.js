// REWORKED: SUPABASE STORAGE

const multer = require('multer');

const ALLOWED_TYPE = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024; // 5mb max

const fileFilter = (req, file, cb) => {
    if (ALLOWED_TYPE.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato no permitido. Use PDF, PNG o JPG'));
    }
};

// memoryStorage: file stays in req.file.buffer, nothing written to disk
module.exports = multer({ storage: multer.memoryStorage(), fileFilter, limits: { fileSize: MAX_SIZE } });
