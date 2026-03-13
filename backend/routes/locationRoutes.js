const express = require('express');
const router = express.Router();

const locationController = require('../controllers/locationController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', locationController.getAllLocation);
router.get('/:id', locationController.getLocationById);
router.post('/', locationController.createLocation);
router.put('/:id', locationController.updateLocation);
router.delete('/:id', locationController.deleteLocation);
router.patch('/:id', locationController.restoreLocation);


module.exports = router;