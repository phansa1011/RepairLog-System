const express = require('express');
const router = express.Router();

const partController = require('../controllers/partController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', partController.getAllPart);
router.get('/:id', partController.getPartById);
router.post('/', partController.createPart);
router.put('/:id', partController.updatePart);
router.delete('/:id', partController.deletePart);
router.patch('/:id', partController.restorePart);

module.exports = router;