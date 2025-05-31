const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const regValidate = require('../utilities/account-validation')

// Route to get Inventory classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to get Inventory detail view
router.get("/detail/:inv_id", invController.getVehicleDetails);

// Route to get Management view
router.get("/", invController.managementView)

// Route to add a new classification
router.get("/add-new-classification", invController.classificationView)

// Route to add a new vehicle to inventory
router.get("/add-new-inventory", invController.InventoryView)

// Route to add new classification
router.post(
    "/add-new-classification",
    regValidate.ClassificationRules(),
    regValidate.checkClassData,
    invController.AddNewClassification
)

// Route to add new inventory
router.post(
    "/add-new-inventory",
    regValidate.InventoryListRules(),
    regValidate.checkInventoryData,
    invController.addNewInventoryController
)

module.exports = router;