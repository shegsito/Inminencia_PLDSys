const express    = require('express');
const router     = express.Router();
const dashboard = require('../../controllers/operador/dashboardController');
const operaciones = require('../../controllers/operador/operacionesController');
const clientes = require('../../controllers/operador/clientesController');

//pages
router.get('/dashboard', dashboard.operador_index);
router.get('/operaciones', operaciones.index);
router.get('/clientes', clientes.index);

//data
router.get('/operaciones/operacionesCount', operaciones.count);
router.get('/operaciones/operacionesData', operaciones.operaciones);

router.get('/clientes/:id',    clientes.getCliente);
//forms
router.get('/reportar',  dashboard.operador_reporte);
router.post('/reportar', (req, res) => res.redirect('/operador/dashboard'));

module.exports = router;
