const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    let nav = await utilities.getNav()

    if (!data || data.length === 0) {
        res.render("./inventory/classification", {
            title: "No vehicles found",
            nav,
            grid: "<p>No vehicles in this classification yet.</p>"
        })
        return
    }

    const grid = await utilities.buildClassificationGrid(data)
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}


// build inventory details page by using getVehicleById
invCont.getVehicleDetails = async function (req, res, next) {
    const inv_id = req.params.inv_id
    const data = await invModel.getVehicleById(inv_id)
    let nav = await utilities.getNav()
    const grid = await utilities.buildVehicleDetailView(data)

    res.render("./inventory/invDetail", {
        title: `${data.inv_year} ${data.inv_make} ${data.inv_model}`,
        nav,
        vehicleDetail: grid,
    })
}

// Intentional error trigger
invCont.triggerError = function (req, res, next) {
    const error = new Error("intentional error process")
    error.status = 500
    next(error)
}

// Build management view
invCont.managementView = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null
    })
}

// Build classification view
invCont.classificationView = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null
    })
}

// Add classification
invCont.AddNewClassification = async function (req, res, next) {
    let nav = await utilities.getNav()
    const { classification_name } = req.body
    const classResults = await invModel.addClassification(classification_name)
    const classificationSelect = await utilities.buildClassificationList()

    if (classResults) {
        req.flash("notice", "Classification added successfully.")
        res.status(201).render("inventory/management", {
            title: "Mangement",
            nav,
            errors: null,
            classificationSelect
        })
    } else {
        req.flash("notice", "Failed to add classification.")
        res.status(501).render("inventory/add-classification", {
            title: "Add New Classification",
            nav,
            errors: null
        })
    }
}

module.exports = invCont