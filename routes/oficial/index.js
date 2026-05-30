const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const upload   = multer({ dest: 'uploads/' });

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
router.get('/registrar-operacion', operaciones.getRegistrarOperacion);
router.post('/new-operacion', operaciones.postRegistrarOperacion);
router.get('/registrar-contrato', contratos.getRegistrarContrato);
router.post('/new-contrato', contratos.postRegistrarContrato);
router.get('/evaluar-reporte', (req, res) =>
    res.render('oficial/forms/evaluar-caso-form', {
        pageTitle: 'Forma de evaluación' }));
router.post('/evaluar-caso', canalInterno.evaluation);
router.get('/reportes/generar', reportes.dailyReport);
router.get('/Subir-lista', (req, res) =>
    res.render('oficial/forms/listas-form', {
        pageTitle: 'Subir Lista' }));
router.post('/listas/upload', upload.single('archivo'), listas.uploadLista);

//return the data
router.get('/operaciones/operacionesCount', operaciones.count);
router.get('/operaciones/operacionesData', operaciones.operaciones);
router.get('/dashboard/api/alertasDataDashboard', dashboard.alertas);
router.get('/dashboard/api/clientesDataDashboard', dashboard.clientes);
router.get('/dashboard/api/operacionesDataDashboard', dashboard.operaciones);
router.get(`/alertas/api/alertasData`, alertas.getAlertasData);
router.get('/contratos/contratosCount', contratos.count);
router.get('/contratos/contratosData', contratos.contratos);
router.get('/canalInterno/canalInternoData', canalInterno.getCanalInternoData);
router.get('/reportes/reportesData', reportes.getReportesData);
router.get('/listas/api/listasPEPData', listas.listasPEP);
router.get('/listas/api/listasLPBData', listas.listasLPB);
router.get('/listas/api/historialListasData', listas.fetchHistorialListas);

router.get('/clientes/:id',    clientes.getCliente);
router.put('/clientes/:id',    clientes.actualizarCliente);
router.get('/documentos/:id',  clientes.verDocumento);
router.get('/evidencia/:id', canalInterno.verEvidencia);
router.get('/descargar/:id', reportes.downloadReport);
module.exports = router;
