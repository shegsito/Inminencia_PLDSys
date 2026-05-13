const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/oficial/contratosController');

router.get('/', controller.index);

module.exports = router;
