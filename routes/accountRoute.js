const express = require("express")
const router = new express.Router()
const accController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

// Route to get Account login view
router.get("/login", utilities.handleErrors(accController.buildLogin));

// Route to build the Account register page
router.get("/register", utilities.handleErrors(accController.buildRegister))

// Route to register an account and process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accController.registerAccount)
)

// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLogData,
    (req, res) => {
        res.status(200).send('login process')
    }
)

module.exports = router;