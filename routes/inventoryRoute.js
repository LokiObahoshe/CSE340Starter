const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const regValidate = require('../utilities/account-validation')
const utilities = require("../utilities")

// Route to get Inventory classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to get Inventory detail view
router.get("/detail/:inv_id", utilities.handleErrors(invController.getVehicleDetails))

// Route to get Management view
router.get("/", utilities.handleErrors(invController.managementView))

// Route to add a new classification
router.get("/add-new-classification", utilities.handleErrors(invController.classificationView))

// Route to add a new vehicle to inventory
router.get("/add-new-inventory", utilities.handleErrors(invController.InventoryView))

// Route to get inventory for inventory table
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to get the vehicle edit view
router.get("/edit/:inv_id", utilities.handleErrors(invController.buildInvEdit))

// Delete an item route for delete page
router.get("/delete/:inv_id", utilities.handleErrors(invController.buildDeleteView))

// Route to add new classification
router.post(
  "/add-new-classification",
  regValidate.ClassificationRules(),
  regValidate.checkClassData,
  utilities.handleErrors(invController.AddNewClassification)
)

// Route to add new inventory
router.post(
  "/add-new-inventory",
  regValidate.InventoryListRules(),
  regValidate.checkInventoryData,
  utilities.handleErrors(invController.addNewInventoryController)
)

// Route for edit page update
router.post("/update/",
  regValidate.InventoryListRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

// Inventory route for edit page
router.post("/delete/",
  //regValidate.InventoryListRules(),
  //regValidate.checkUpdateData,
  utilities.handleErrors(invController.deleteItem)
)

module.exports = router;