const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuariosController');

router.get('/login', controller.render_login);
router.post('/login', controller.do_login);

module.exports = router;