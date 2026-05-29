const express = require('express');
const router  = express.Router();
const { requireLogin, requireRol } = require('../middleware/session-auth');
const usuarios = require('../controllers/usuariosController');

// Page routes — protected by session login + role check
router.use('/oficial',   requireLogin, requireRol(['oficial']),  require('./oficial'));
router.use('/admin',     requireLogin, requireRol(['admin']),     require('./admin'));
router.use('/operador',  requireLogin, requireRol(['operador']),  require('./operador'));
router.use('/cliente',   requireLogin, requireRol(['cliente']),   require('./cliente'));

// Auth routes — no protection (login page must always be reachable)
router.use('/usuarios',  require('./usuarios'));

// API routes — protected per-route via header-based auth (middleware/auth.js)
router.use('/api/clientes',   require('./api/clientes'));
router.use('/api/expediente', require('./api/expedientes'));

//end session
router.use('/logout', usuarios.logout);

module.exports = router;

