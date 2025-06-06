const express = require("express")
const router = new express.Router()
const accController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

// Route to get Account login view
router.get("/login", utilities.handleErrors(accController.buildLogin));

// Route to build the Account register page
router.get("/register", utilities.handleErrors(accController.buildRegister))

// Route to build the login success page
router.get("/", utilities.checkLogin, utilities.handleErrors(accController.loginSuccess))

// Route to build the login update page
router.get("/update/:account_id", utilities.handleErrors(accController.processUpdate))

// Route to register an account and process the registration data
router.post(
    "/register",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accController.registerAccount)
)

// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLogData,
    utilities.handleErrors(accController.accountLogin)
)

  // Account route for update page (firstname, lastname and email)
router.post("/updateaccount/",
  regValidate.accountUpdateListRules(),
  regValidate.checkAccountUpdateData,
  utilities.handleErrors(accController.updateAccount)
)

  // Account route for update page (password)
  router.post("/updatepassword/",
    regValidate.passwordChangeRules(),
    regValidate.checkAccountPasswordUpdateData,
    utilities.handleErrors(accController.changePassword)
  )

module.exports = router;