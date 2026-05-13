// upload middleware, the one that stores documents and get the allowed types

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ALLOWED_TYPE = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024; // that's 5mb max per document

// multer is a npm dependency that can store different document types into the db
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // save under uploads/expedientes/idExpediente
        const dir = path.join(__dirname, '..', 'uploads', 'expedientes', req.params.idExpediente);
        
        // if the directory doesn't exist, it creates it
        fs.mkdirSync(dir, {recursive: true});

        // callback, no error and directory
        cb(null, dir);
    },

    filename: (req, file, cb) => {
        // unique name to aoid collisions
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `doc_${Date.now()}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    // allowed doc format
    if (ALLOWED_TYPE.includes(file.mimetype)){
        cb(null, true);
    } else { // not allowed type
        cb(new Error('Formato no permitido. Use PDF, PNG o JPG'));
    }
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE}});

