const pool = require("../database/")
const { get } = require("../routes/static")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
    try {
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
        return error.message
    }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1"
        const email = await pool.query(sql, [account_email])
        return email.rowCount
    } catch (error) {
        return error.message
    }
}


/* **********************
 *   This function, despite being almost identical to the last function "checkExistingEmail",
     is used to help with the login incorrect password validation by grabbing
     all the account information instead of just the email
 * ********************* */
async function grabAllAccountData(account_email) {
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1"
        const result = await pool.query(sql, [account_email])
        return result.rows[0]
    } catch (error) {
        return null
    }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
    try {
        const result = await pool.query(
            'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
            [account_email])
        return result.rows[0]
    } catch (error) {
        return new Error("No matching email found")
    }
}

/* *****************************
* Grabs Account information by ID
* ***************************** */
async function getAccountId(account_id) {
    try {
        const sql = "SELECT * FROM public.account WHERE account_id = $1"
        const data = await pool.query(sql, [account_id])
        return data.rows[0]
    } catch (error) {
        return error.message
    }
}

/* *****************************
* Updates account information
* ***************************** */
async function updateAccount(account_firstname, account_lastname, account_email, account_id) {
    try {
        const sql = `UPDATE public.account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *`
        const data = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
        return data.rows[0]
    } catch (error) {
        console.error("Updating Account error: " + error)
        return null
    }
}

/* *****************************
* Updated password
* ***************************** */
async function updatePassword(account_password, account_id) {
    try {
        const sql = `UPDATE public.account SET account_password = $1 WHERE account_id = $2 RETURNING *`
        const data = await pool.query(sql, [account_password, account_id])
        return data.rows[0]
    } catch (error) {
        console.error("Updating Password error: " + error)
        return null
    }
}

async function currentToMember(account_id, account_phone) {
    try {
        const sql = `UPDATE account SET account_type = 'Membership', account_phone = $2 WHERE account_id = $1 AND account_type = 'Client' RETURNING *`
        const data = await pool.query(sql, [account_id, account_phone])
        return data.rows[0]
    } catch (error) {
        console.error("Membership Signup Failed: " + error)
        throw error
    }
}

module.exports = { registerAccount, checkExistingEmail, grabAllAccountData, getAccountByEmail, getAccountId, updateAccount, updatePassword, currentToMember }