const express  = require('express');
const router   = express.Router();

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

router.get('/kyc', (req, res) => {
    res.render('forms/kyc-form', { pageTitle: "Nuevo cliente" });
});


router.post('/new-client', (req, res) => {
    res.redirect('/dashboard');
});

module.exports = router;
