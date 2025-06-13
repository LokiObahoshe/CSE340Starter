const utilities = require("../utilities")
const accModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null
        })
    }

    const regResult = await accModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you\'re registered, ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: null
        })
    }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
            // IMPORTANT: Needed to add this line to verify login succes
            req.session.loggedin = true
            // These lines were added just to make things look prettier
            // and makes sure the "succesful login" message doesn't
            // appear again when the user has logged in
            req.session.loginmessage = true
            req.session.userName = accountData.account_firstname
            req.session.accountType = accountData.account_type
            req.session.accountId = accountData.account_id
            if (process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            } else {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
            }
            return res.redirect("/account/")
        }
        else {
            req.flash("message notice", "Please check your credentials and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        throw new Error('Access Forbidden')
    }
}

async function loginSuccess(req, res, next) {
    let nav = await utilities.getNav()

    if (!req.session || !req.session.loggedin || !req.session.userName) {
        req.flash("notice", "Your session has expired. Please log in again.")
        return res.redirect("/account/login")
    }

    const account_id = req.session.accountId
    if (!account_id) {
        req.flash("notice", "Missing account information. Please log in again.")
        return res.redirect("/account/login")
    }

    const accountData = await accModel.getAccountId(account_id)
    if (!accountData) {
        req.flash("notice", "Account data not found. Please log in again.")
        return res.redirect("/account/login")
    }

    res.render("account/account", {
        title: "Login Success",
        nav,
        errors: null,
        accountType: req.session.accountType,
        session: req.session,
        accountData
    })
}

/* ****************************************
*  Create account make view
* *************************************** */
async function processUpdate(req, res) {
    console.log("Account ID from params:", req.params.account_id)
    const account_id = parseInt(req.params.account_id)
    let nav = await utilities.getNav()
    const accountData = await accModel.getAccountId(account_id)

    res.render("./account/update", {
        title: "Edit Account",
        nav,
        errors: null,
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email
    })
}

/* ****************************************
*  Update account data
* *************************************** */
async function updateAccount(req, res, next) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_id } = req.body
    const updateResult = await accModel.updateAccount(account_firstname, account_lastname, account_email, account_id)

    if (updateResult) {
        req.session.userName = account_firstname
        req.flash("notice", `Your account was successfully updated.`)
        res.redirect("/account")
    } else {
        req.flash("notice", "Sorry, the update failed.")
        res.status(501).render("account/update", {
            title: "Edit Account",
            nav,
            errors: null,
            account_firstname,
            account_lastname,
            account_email,
            account_id
        })
    }
}

/* ****************************************
*  Change password
* *************************************** */
async function changePassword(req, res, next) {
    let nav = await utilities.getNav()
    const { account_password, account_id } = req.body

    const hashedPassword = await bcrypt.hash(account_password, 10)
    const updateResult = await accModel.updatePassword(hashedPassword, account_id)

    if (updateResult) {
        req.flash("notice", "Your password has been successfully changed.")
        res.redirect("/account")
    } else {
        req.flash("notice", "Sorry, the password change failed.")
        res.status(501).render("account/update", {
            title: "Edit Account",
            nav,
            errors: null,
            account_id
        })
    }
}

// Membership signup
async function buildMembershipSignup(req, res, next) {
    let nav = await utilities.getNav()
    const accountData = await accModel.getAccountId(req.params.account_id);
    res.render("account/membership", {
        title: "Membership Signup",
        nav,
        errors: null,
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_phone: accountData.account_phone
    })
}

// Membership signup
async function buildMembershipSuccessView(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/membershipsuccess", {
        title: "Membership Success",
        nav,
        errors: null
    })
}

// Update Account Data, membership
async function membershipSignup(req, res, next) {
    let nav = await utilities.getNav()
    const { account_id, account_phone } = req.body
    const memberResult = await accModel.currentToMember(account_id, account_phone)

    if (memberResult) {
        req.session.accountType = 'Member';
        res.redirect("membershipsuccess")
    } else {
        req.flash("notice", "Sorry, the membership signup failed.")
        res.status(501).render("account/membership", {
            title: "Membership Signup",
            nav,
            errors: null,
            account_id
        })
    }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, loginSuccess, processUpdate, changePassword, updateAccount, buildMembershipSignup, buildMembershipSuccessView, membershipSignup }