const express    = require('express');
const router     = express.Router();
const dashboard  = require('../../controllers/admin/dashboardController');
const bitacora   = require('../../controllers/admin/bitacoraController');
const usuarios   = require('../../controllers/admin/usuariosController');

router.get('/administrar',           dashboard.admin_index);
router.get('/bitacora',              bitacora.bitacora);
router.get('/gestionar',             usuarios.gestionar);
router.patch('/usuarios/:id/activo', usuarios.toggleActivo);
router.post('/usuarios',             usuarios.crearUsuario);

module.exports = router;
