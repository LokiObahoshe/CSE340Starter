const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")

// Route to get Inventory classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to get Inventory detail view
router.get("/detail/:inv_id", invController.getVehicleDetails);

module.exports = router;