const express = require('express');
const router = express.Router();

router.use('/api/clientes',   require('./api/clientes'));
router.use('/api/expediente', require('./api/expedientes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/clientes', require('./clientesRoutes'));
router.use('/contratos', require('./contratosRoutes'));
router.use('/expedientes', require('./expedientesRoutes'));
router.use('/listas', require('./listasRoutes'));
router.use('/reportes', require('./reportesRoutes'));
router.use('/canal-interno', require('./canalInternoRoutes'));
router.use('/alertas', require('./alertasRoutes'));
router.use('/usuarios', require('./usuariosRoutes'));

router.use('/admin', require('./adminRoutes'));
router.use('/operador', require('./operadorRoutes'));

router.get('/kyc', (req, res) => {
    res.render('forms/kyc-form', { pageTitle: "Nuevo cliente" });
});



//route to connect new client button with form
router.get('/kyc', (req, res, next) => {
    res.render('forms/kyc-form', {
        pageTitle: "Nuevo cliente"
    });
});

router.post('/new-client', (req, res, next) => {
    res.redirect('/dashboard');
});


module.exports = router;
