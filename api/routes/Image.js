const express = require('express');
const middleware = require('../helper/middleware');
const apiKeyAuth = require('../middlewares/apiKeyAuth'); // Import middleware
const router = express.Router(),
  Controller = require('../controllers/ImageController');

router.get('/', apiKeyAuth, Controller.get);
router.get('/detail/:image_id', Controller.getDetail);
router.post('/', middleware.authAdmin, Controller.add);
router.post('/edit', middleware.authAdmin, Controller.update);
router.delete('/', middleware.authAdmin, Controller.delete);

module.exports = router;