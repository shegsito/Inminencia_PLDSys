const express    = require('express');
const router     = express.Router({ mergeParams: true });
const auth       = require('../../middleware/auth');
const upload     = require('../../middleware/upload');
const controller = require('../../controllers/api/expedientesController');

// POST /api/expediente/:idExpediente/documentos
router.post(
    '/:idExpediente/documentos',
    auth(['cliente', 'operador', 'oficial']),
    upload.single('archivo'),
    controller.subirDocumento
);

module.exports = router;
