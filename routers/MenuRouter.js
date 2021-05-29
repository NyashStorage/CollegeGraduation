const { Router } = require("express");
const { dbManager } = require("../app");

class MenuRouter {
    #router = Router();
    getRouter() {
        return this.#router;
    }

    constructor() {
        this.#router.get("/get", async (req, res) => {
            res.send(await dbManager.query("SELECT title, link FROM pages WHERE menu=true"));
        })
    }
}

module.exports = new MenuRouter();
