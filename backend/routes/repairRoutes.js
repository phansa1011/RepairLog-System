const express = require('express');
const router = express.Router();

const repairController = require('../controllers/repairController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', repairController.getAllRepairs);
router.get('/:id', repairController.getRepairById);
router.post('/', repairController.createRepairWithWorkers);
router.put('/:id', repairController.updateRepair);
router.delete('/:id', repairController.deleteRepair);

module.exports = router;