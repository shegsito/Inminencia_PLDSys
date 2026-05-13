const express = require('express');
const router = express.Router();

<<<<<<< HEAD
router.use('/dashboard',     require('./dashboard'));
router.use('/clientes',      require('./clientes'));
router.use('/contratos',     require('./contratos'));
router.use('/expedientes',   require('./expedientes'));
router.use('/listas',        require('./listas'));
router.use('/reportes',      require('./reportes'));
router.use('/canal-interno', require('./canalInterno'));
router.use('/alertas',       require('./alertas'));
router.use('/api/clientes',   require('./api/clientes'));
router.use('/api/expediente', require('./api/expedientes'));
=======
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
>>>>>>> feature/login

router.get('/kyc', (req, res) => {
    res.render('forms/kyc-form', { pageTitle: "Nuevo cliente" });
});


router.post('/new-client', (req, res) => {
    res.redirect('/dashboard');
});

module.exports = router;
