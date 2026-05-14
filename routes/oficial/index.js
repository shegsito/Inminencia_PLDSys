const express  = require('express');
const router   = express.Router();

const dashboard    = require('../../controllers/oficial/dashboardController');
const clientes     = require('../../controllers/oficial/clientesController');
const alertas      = require('../../controllers/oficial/alertasController');
const canalInterno = require('../../controllers/oficial/canalInternoController');
const contratos    = require('../../controllers/oficial/contratosController');
const operaciones  = require('../../controllers/oficial/operacionesController');
const listas       = require('../../controllers/oficial/listasController');
const reportes     = require('../../controllers/oficial/reportesController');

router.get('/dashboard',     dashboard.index);
router.get('/clientes',      clientes.index);
router.get('/alertas',       alertas.index);
router.get('/canal-interno', canalInterno.index);
router.get('/contratos',     contratos.index);
router.get('/operaciones',   operaciones.index);
router.get('/listas',        listas.index);
router.get('/reportes',      reportes.index);

router.get('/kyc',           (req, res) => res.render('oficial/forms/kyc-form', { pageTitle: 'Nuevo cliente' }));
router.post('/new-client',   (req, res) => res.redirect('/oficial/dashboard'));

module.exports = router;
