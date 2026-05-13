const express    = require('express');
const router     = express.Router();
const controller = require('../../controllers/admin/dashboardController');

router.get('/dashboard', controller.admin_index);

module.exports = router;
