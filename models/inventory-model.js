const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
            [classification_id]
        )
        return data.rows
    } catch (error) {
        console.error("getclassificationsbyid error " + error)
    }
}

// Get all vehicles by their respective ID's using "inv_id"
async function getVehicleById(inv_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory 
       WHERE inv_id = $1`,
            [inv_id]
        )
        return data.rows[0]
    } catch (error) {
        console.error("getVehicleById error: " + error)
    }
}

// Add the classification to database
async function addClassification(classification_name) {
    try {
        const sql = await pool.query(`INSERT INTO public.classification (classification_name) VALUES ($1)`, [classification_name])
        return sql
    } catch (error) {
        console.error("addClassification error: " + error)
        throw error
    }
}

// Check for existing class
async function checkExistingClass(classification_name) {
    try {
        const sql = "SELECT * FROM classification WHERE classification_name = $1"
        const checkClass = await pool.query(sql, [classification_name])
        return checkClass.rowCount
    } catch (error) {
        return error.message
    }
}

module.exports = { getClassifications, getInventoryByClassificationId, getVehicleById, addClassification, checkExistingClass }