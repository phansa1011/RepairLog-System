const express = require('express');
const router = express.Router();

const devicePartController = require('../controllers/devicePartController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', devicePartController.getAllDevicePart);
router.get('/:id', devicePartController.getDevicePartById);
router.post('/', devicePartController.addPartsToDevice);
router.put('/:id', devicePartController.updateDevicePart);
router.delete('/:id', devicePartController.deleteDevicePart);

module.exports = router;