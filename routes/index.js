const express = require('express');
const router  = express.Router();

router.use('/oficial',   require('./oficial'));
router.use('/admin',     require('./admin'));
router.use('/operador',  require('./operador'));
router.use('/usuarios',  require('./usuarios'));
router.use('/api/clientes',   require('./api/clientes'));
router.use('/api/expediente', require('./api/expedientes'));

module.exports = router;
