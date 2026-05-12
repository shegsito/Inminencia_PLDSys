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

router.get('/kyc', (req, res, next) => {

    res.render('forms/kyc-form', {
        pageTitle: "Nuevo cliente"
    });
});

router.post('/new-client', (req, res, next) => {

    res.redirect('/dashboard');
});

module.exports = router;
