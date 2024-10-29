const express = require("express");
const router = express.Router();
const standardController = require("../controllers/standardController");

router.post("/", standardController.createStandard);
router.get("/", standardController.getAllStandards);
router.put("/:id", standardController.updateStandard);
router.delete("/:id", standardController.deleteStandard);

module.exports = router;
