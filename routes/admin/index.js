const express    = require('express');
const router     = express.Router();
const controller = require('../../controllers/admin/dashboardController');

router.get('/administrar', controller.admin_index);
router.get('/bitacora',   controller.bitacora);

module.exports = router;
