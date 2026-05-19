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

router.get('/kyc', (req, res) => 
    res.render('oficial/forms/kyc-form', { 
        pageTitle: 'Nuevo cliente' }));
router.post('/new-client', (req, res) => 
    res.redirect('/oficial/dashboard'));
router.get('/registrar-operacion', (req, res) =>
    res.render('oficial/forms/nueva-operacion-form', {
        pageTitle: 'Nueva Operacion' }));
router.post('/new-operacion', operaciones.registrarOperacion);
router.get('/registrar-contrato', (req, res) =>
    res.render('oficial/forms/nuevo-contrato-form', {
        pageTitle: 'Nuevo contrato' }));
router.post('/new-contrato', contratos.registrarContrato);

//return the data
router.get('/operaciones/operacionesCount', operaciones.count);
router.get('/operaciones/operacionesData', operaciones.operaciones);
router.get('/dashboard/api/alertasDataDashboard', dashboard.alertas);
router.get('/dashboard/api/clientesDataDashboard', dashboard.clientes);
router.get('/dashboard/api/operacionesDataDashboard', dashboard.operaciones);
router.get(`/alertas/api/alertasData`, alertas.getAlertasData);
router.get('/contratos/contratosCount', contratos.count);
router.get('/contratos/contratosData', contratos.contratos);

module.exports = router;
