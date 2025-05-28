const express = require("express")
const router = new express.Router()
const accController = require("../controllers/accountController")
const utilities = require("../utilities")

// Route to get Account login view
router.get("/login", utilities.handleErrors(accController.buildLogin));

// Route to build the Account register page
router.get("/register", utilities.handleErrors(accController.buildRegister))

// Route to register an account and process the registration data
router.post('/register', utilities.handleErrors(accController.registerAccount))

module.exports = router;