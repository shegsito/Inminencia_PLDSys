const express    = require('express');
const router     = express.Router();
const registro   = require('../../controllers/cliente/registroController');

router.get('/', registro.index);

module.exports = router;
