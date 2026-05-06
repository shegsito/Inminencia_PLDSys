const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/clientesController');

router.get('/', controller.index);

module.exports = router;
