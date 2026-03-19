const express = require('express');
const router = express.Router();

const deviceController = require('../controllers/deviceController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', deviceController.getAllDevice);
router.post('/', deviceController.createDevice);
router.put('/:id', deviceController.updateDevice);
router.delete('/:id', deviceController.deleteDevice);
router.patch('/:id', deviceController.restoreDevice);

module.exports = router;