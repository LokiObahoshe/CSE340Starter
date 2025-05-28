const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const accModel = require("../models/account-model")
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

module.exports = validate