const express    = require('express');
const router     = express.Router();
const controller = require('../../controllers/api/clientesController');

router.post('/', controller.registrar);

module.exports = router;
