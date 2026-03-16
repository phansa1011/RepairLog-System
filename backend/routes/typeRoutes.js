const express = require("express");
const router = express.Router();

const typeController = require("../controllers/typeController");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/", typeController.getAllTypes);
router.post("/", typeController.createType);
router.put("/:id", typeController.updateType);

module.exports = router;