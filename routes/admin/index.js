const express    = require('express');
const router     = express.Router();
const dashboard  = require('../../controllers/admin/dashboardController');
const bitacora   = require('../../controllers/admin/bitacoraController');
const usuarios   = require('../../controllers/admin/usuariosController');

const blockAuditor = (req, res, next) => {
    if (req.session?.rol === 'auditor') return res.status(403).send('Acción no permitida para auditor');
    next();
};

router.get('/administrar',           dashboard.admin_index);
router.get('/bitacora',              bitacora.bitacora);
router.get('/gestionar',             usuarios.gestionar);
router.patch('/usuarios/:id/activo', blockAuditor, usuarios.toggleActivo);
router.post('/usuarios',             blockAuditor, usuarios.crearUsuario);

module.exports = router;
