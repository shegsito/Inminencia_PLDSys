const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });
const { processWatchlistUpload } = require('../../controllers/api/watchlistIngestController');

router.post('/admin/ingest-listas', upload.single('archivo'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo.' });
    if (!req.body.tipo_lista) return res.status(400).json({ error: 'No se especificó el tipo de lista.' });

    try {
        const reporting = await processWatchlistUpload(req.file.path, req.body.tipo_lista);
        
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        
        res.status(200).json({ status: 'SUCCESS', details: reporting });
    } catch (ingestError) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: ingestError.message });
    }
});

module.exports = router;