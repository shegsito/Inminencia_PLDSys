const express    = require('express');
const router     = express.Router();
const controller = require('../../controllers/operador/dashboardController');

router.get('/dashboard', controller.operador_index);
router.get('/reportar',  controller.operador_reporte);
router.post('/reportar', (req, res) => res.redirect('/operador/dashboard'));

module.exports = router;
