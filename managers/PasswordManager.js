const { dbManager } = require("../app");

async function validatePassword(password) {
    return password === (await dbManager.query("SELECT value FROM variables WHERE variable='password'"))[0].value;
}

module.exports = { validatePassword };
