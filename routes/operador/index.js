const express = require('express');
const router = express.Router();
const dashboard = require('../../controllers/operador/dashboardController');
const operaciones = require('../../controllers/operador/operacionesController');
const clientes = require('../../controllers/operador/clientesController');

//pages
router.get('/dashboard', dashboard.operador_index);
router.get('/operaciones', operaciones.index);
router.get('/clientes', clientes.index);
router.get('/caso-estatus', dashboard.operador_estatus);

//data
router.get('/operaciones/operacionesCount', operaciones.count);
router.get('/operaciones/operacionesData', operaciones.operaciones);
router.get('/clientes/:id',    clientes.getCliente);
router.get('/caso-estatus/casoEstatusCount', dashboard.count);
router.get('/caso-estatus/casoEstatusData', dashboard.casoEstatus);

//forms
router.get('/reportar',  dashboard.operador_reporte);
router.post('/reportar', dashboard.upload, dashboard.createInternal);

router.get('/kyc', (req, res) => 
    res.render('operador/forms/kyc-form', { 
        pageTitle: 'Nuevo cliente' }));
router.post('/new-client', (req, res) => 
    res.redirect('/operador/dashboard'));

module.exports = router;
