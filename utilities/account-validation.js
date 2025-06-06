const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const accModel = require("../models/account-model")
const invModel = require("../models/inventory-model")
const bcrypt = require("bcryptjs")

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registrationRules = () => {
    return [
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty().withMessage("First name is required.")
            .bail()
            .isLength({ min: 1 }).withMessage("First name must be at least 1 character."),

        body("account_lastname")
            .trim()
            .escape()
            .notEmpty().withMessage("Last name is required.")
            .bail()
            .isLength({ min: 2 }).withMessage("Last name must be at least 2 characters."),

        body("account_email")
            .trim()
            .notEmpty().withMessage("Email is required.")
            .bail()
            .isEmail().withMessage("A valid email is required.")
            .normalizeEmail() // refer to validator.js docs
            .custom(async (account_email) => {
                const emailExists = await accModel.checkExistingEmail(account_email)
                if (emailExists) {
                    throw new Error("Email exists. Please log in or use different email.")
                }
            }),

        body("account_password")
            .trim()
            .notEmpty().withMessage("Password is required.")
            .bail()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            }).withMessage("Password does not meet requirements."),
    ]
}

/*  **********************************
  *  Login Data Validation Rules
  * ********************************* */
validate.loginRules = () => {
    return [
        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail()
            .withMessage("Email is required.")
            .bail()
            .custom(async (account_email, { req }) => {
                const account = await accModel.grabAllAccountData(account_email)
                if (!account) {
                    throw new Error("Email does not exist. Please sign up.")
                }
                // Used to help with incorrect credentials
                req.account = account
            }),

        body("account_password")
            .trim()
            .notEmpty().withMessage("Password is required.")
            .bail()
            // This custom is used to check if the password is correct
            .custom(async (password, { req }) => {
                if (!req.account) {
                    return true
                }

                const match = await bcrypt.compare(password, req.account.account_password)
                if (!match) {
                    throw new Error("Incorrect password.")
                }
                return true
            })
    ]
}

/* ******************************
 * Classification Data Validation Rules
 * ***************************** */
validate.ClassificationRules = () => {
    return [
        body("classification_name")
            .trim()
            .escape()
            .notEmpty().withMessage("Name was empty.")
            .bail()
            .matches("^[A-Za-z]+$")
            .withMessage("Please provide a correct classification name.")
            .custom(async (classification_name) => {
                const classExists = await invModel.checkExistingClass(classification_name)
                if (classExists) {
                    throw new Error("This class already exists")
                }
            })
    ]
}

/* ******************************
 * Check data and return errors or continue to Add Inventory view
 * ***************************** */
validate.InventoryListRules = () => {
    return [
        body("inv_make")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a make."),

        body("inv_model")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a model."),

        body("inv_description")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a description."),

        body("inv_image")
            .trim()
            .notEmpty()
            .withMessage("Please provide an image path."),

        body("inv_thumbnail")
            .trim()
            .notEmpty()
            .withMessage("Please provide a thumbnail path."),

        body("inv_price")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a price."),

        body("inv_year")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a year."),

        body("inv_miles")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide the miles."),

        body("inv_color")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a color."),

        body("classification_id")
            .notEmpty().withMessage("Please select a classification.")
            .bail()
            .isInt({ min: 1 }).withMessage("Invalid classification selected."),
    ]
}

/* ******************************
 * Check data and return errors or continue to login
 * ***************************** */
validate.checkLogData = async (req, res, next) => {
    const { account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/login", {
            errors,
            title: "Login",
            nav,
            account_email,
        })
        return
    }
    next()
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/register", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

/* ******************************
 * Check data and return errors or continue to Add Classification view
 * ***************************** */
validate.checkClassData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors,
            title: "Add New Classification",
            nav,
            classification_name,
        })
        return
    }
    next()
}

// Checks for the entire inventory list
validate.checkInventoryData = async (req, res, next) => {
    const { inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        const classificationList = await utilities.buildClassificationList(classification_id)
        let nav = await utilities.getNav()
        res.render("inventory/add-inventory", {
            errors,
            title: "Add New Inventory",
            nav,
            classificationList,
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            classification_id
        })
        return
    }
    next()
}

// Checks for errors and redirect back to edit view
validate.checkUpdateData = async (req, res, next) => {
    const { inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_id, classification_id } = req.body
    const classificationList = await utilities.buildClassificationList(classification_id)
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/edit-inventory", {
            errors,
            title: "Edit ",
            nav,
            classificationList,
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            inv_id,
            classification_id
        })
        return
    }
    next()
}

// Redirects errors back to the update view
validate.checkAccountUpdateData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/update", {
            errors,
            title: "Edit ",
            nav,
            account_firstname,
            account_lastname,
            account_email
        })
        return
    }
    next()
}

// Update account errors (firstname, lastname and email)
validate.accountUpdateListRules = () => {
    return [
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a first name."),

        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a last name."),

        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required.")
            .custom(async (account_email, { req }) => {
                const existingAccount = await accModel.getAccountByEmail(account_email)
                const incomingId = parseInt(req.body.account_id, 10)

                if (existingAccount && existingAccount.account_id !== incomingId) {
                    throw new Error("Email exists. Please use a different email.")
                }
            })
    ]
}

validate.checkAccountPasswordUpdateData = async (req, res, next) => {
    const { account_password, account_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/update", {
            errors,
            title: "Edit ",
            nav,
            account_password,
            account_id
        })
        return
    }
    next()
}

// Update account errors (password)
validate.passwordChangeRules = () => {
    return [
        body("account_password")
            .trim()
            .notEmpty().withMessage("A password is required.")
            .bail()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ]
}

module.exports = validate