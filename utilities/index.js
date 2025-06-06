const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let list = '<ul class="navigationul">'
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
    let grid
    if (data.length > 0) {
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
                + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + 'details"><img src="' + vehicle.inv_thumbnail
                + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + ' on CSE Motors"></a>'
            grid += '<div class="namePrice">'
            grid += '<hr>'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
                + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
                + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
                + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList =
        '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
        classificationList += '<option value="' + row.classification_id + '"'
        if (
            classification_id != null &&
            row.classification_id == classification_id
        ) {
            classificationList += " selected "
        }
        classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
}

/* **************************************
* Build the inventory view HTML
* ************************************ */
Util.buildVehicleDetailView = async function (data) {
    let grid = '<div class="vehicle-detail">'

    grid += `<div>`
    grid += `<img src="${data.inv_image}" alt="Image of ${data.inv_make} ${data.inv_model}">`
    grid += `</div>`

    grid += `<div>`
    grid += `<div class="detail-row"><h2>${data.inv_make} ${data.inv_model} Details</h2></div>`
    grid += `<div class="detail-row"><h2>Price: $${new Intl.NumberFormat('en-US').format(data.inv_price)}</h2></div>`
    grid += `<div class="detail-row"><p><b>Description:</b> ${data.inv_description}</p></div>`
    grid += `<div class="detail-row"><p>Color: ${data.inv_color}</p></div>`
    grid += `<div class="detail-row"><p>Mileage: ${new Intl.NumberFormat('en-US').format(data.inv_miles)}</p></div>`
    grid += `</div>`

    grid += '</div>'
    return grid
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
    if (req.session.loggedin) {
        res.locals.loggedin = true
        next()
    } else {
        req.flash("notice", "Login failed")
        return res.redirect("/account/login")
    }
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            function (err, accountData) {
                if (err) {
                    req.flash("Please log in")
                    res.clearCookie("jwt")
                    return res.redirect("/account/login")
                }
                res.locals.accountData = accountData
                res.locals.loggedin = 1
                next()
            })
    } else {
        next()
    }
}

Util.checkEmployeeOrAdmin = (req, res, next) => {
    const token = req.cookies.jwt
    if (!token) {
        req.flash("notice", "You must be logged in to access this area.")
        return res.redirect("/account/login")
    }

    try {
        const accountData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        if (accountData.account_type === "Employee" || accountData.account_type === "Admin") {
            res.locals.accountData = accountData
            next()
        } else {
            req.flash("notice", "You do not have permission to access this area.")
            return res.redirect("/account/")
        }
    } catch (error) {
        console.error("JWT verification failed:", error.message)
        req.flash("notice", "Access denied. Please log in.")
        res.clearCookie("jwt")
        return res.redirect("/account/login")
    }
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util