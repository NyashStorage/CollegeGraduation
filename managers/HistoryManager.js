const { dbManager } = require("../app");

async function addHistory(query, restoreQuery) {
    await dbManager.query(`INSERT INTO history('query', 'restore', 'date') VALUES ('${ query.replace(/'/g, "\"") }', '${ restoreQuery.replace(/'/g, "\"") }', ${ Date.now() })`);
}

module.exports = { addHistory };
