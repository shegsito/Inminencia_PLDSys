const express = require('express');
const router = express.Router();

router.use('/dashboard', require('./dashboard.routes'));
router.use('/clientes', require('./clientes.routes'));
router.use('/contratos', require('./contratos.routes'));
router.use('/expedientes', require('./expedientes.routes'));
router.use('/listas', require('./listas.routes'));
router.use('/reportes', require('./reportes.routes'));
router.use('/canal-interno', require('./canalInterno.routes'));
router.use('/alertas', require('./alertas.routes'));
router.use('usuarios', require('./usuarios.routes'));

router.get('/kyc', (req, res, next) => {

    res.render('forms/kyc-form', {
        pageTitle: "Nuevo cliente"
    });
});

router.post('/new-client', (req, res, next) => {

    res.redirect('/dashboard');
});

module.exports = router;
