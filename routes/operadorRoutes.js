const express = require('express');
const router = express.Router();
const controller = require('../controllers/operadorController');

router.get('/dashboard', controller.operador_index);

//route to connect report creation button with form
router.get('/reportar', controller.operador_reporte);

router.post('/reportar', (req, res, next) => {
    res.redirect('/operador/dashboard');
});

module.exports = router;
