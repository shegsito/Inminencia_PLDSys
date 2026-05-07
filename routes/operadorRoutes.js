const express = require('express');
const router = express.Router();
const controller = require('../controllers/operadorController');

router.get('/dashboard', controller.operador_index);

module.exports = router;
