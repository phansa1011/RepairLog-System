const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");
const auth = require('../middleware/auth');

router.use(auth);

router.get("/", categoryController.getAllCategories);
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);

module.exports = router;