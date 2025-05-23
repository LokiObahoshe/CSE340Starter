const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
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

// Intentional error
invCont.triggerError = function (req, res, next) {
    const error = new Error("intentional error process")
    error.status = 500
    next(error)
}

module.exports = invCont