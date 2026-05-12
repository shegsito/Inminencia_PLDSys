const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/expedientesController');

router.get('/', controller.index);

module.exports = router;
