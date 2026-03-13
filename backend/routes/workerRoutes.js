const express = require('express');
const router = express.Router();

const workerController = require('../controllers/workerController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', workerController.getAllWorks);
router.get('/:id', workerController.getWorkerById);
router.post('/', workerController.createWorker);
router.put('/:id', workerController.updateWorker);
router.delete('/:id', workerController.deleteWorker);
router.patch('/:id', workerController.restoreWorker)

module.exports = router;