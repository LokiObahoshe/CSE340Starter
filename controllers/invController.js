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

// Build Inventory View
invCont.InventoryView = async function (req, res, next) {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
        title: "Add new Vehicle",
        nav,
        classificationList,
        errors: null
    })
}

// Add classification
invCont.AddNewClassification = async function (req, res, next) {
    const { classification_name } = req.body

    // Created to assist with catching errors and updating nav
    let classificationSelect
    let nav

    try {
        const classResults = await invModel.addClassification(classification_name)
        classificationSelect = await utilities.buildClassificationList()
        nav = await utilities.getNav()
        res.locals.nav = nav

        if (classResults) {
            req.flash("notice", "Classification added successfully.")
            res.status(201).render("inventory/management", {
                title: "Management",
                errors: null,
                classificationSelect,
                nav,
            })
        } else {
            req.flash("notice", "Failed to add classification.")
            res.status(501).render("inventory/add-classification", {
                title: "Add New Classification",
                errors: null,
                classificationSelect,
                nav,
            })
        }
    } catch (error) {
        console.error("Error adding classification:", error.message)

        classificationSelect = await utilities.buildClassificationList()
        nav = await utilities.getNav()
        res.locals.nav = nav

        req.flash("notice", `Classification Insertion Error: ${error.message}`)
        res.status(500).render("inventory/add-classification", {
            title: "Add New Classification",
            errors: null,
            classificationSelect,
            nav,
        })
    }
}


// Add inventory
invCont.addNewInventoryController = async function (req, res) {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)
    const { inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id } = req.body

    try {
        const inventoryResults = await invModel.addNewInventoryModel(
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
        )

        if (inventoryResults) {
            req.flash("notice", "Successfully added vehicle.")
            res.status(201).render("inventory/management", {
                title: "Inventory Management",
                nav,
                errors: null,
                classificationList
            })
        } else {
            req.flash("notice", "Failed to add vehicle.")
            res.status(501).render("inventory/add-new-inventory", {
                title: "Inventory Management",
                nav,
                classificationList,
                errors: null,
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
        }
    } catch (error) {
        console.error("Error adding inventory:", error.message)
        req.flash("notice", `Vehicle Insertion Error: ${error.message}, please adjust your vehicle information.`)
        res.status(500).render("inventory/add-inventory", {
            title: "Add New Inventory",
            nav,
            classificationList,
            errors: null,
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
    }

}

module.exports = invCont