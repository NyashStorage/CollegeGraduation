const { Router } = require("express");
const { dbManager } = require("../app");
const { validatePassword } = require("../managers/PasswordManager");

class HistoryRouter {
    #router = new Router();
    getRouter() {
        return this.#router;
    }

    constructor() {
        this.#router.get("/get", async (req, res) => {
            if(!req.query || !req.query.password) return res.status(406).json({ message: `Данные не отправлены.` });

            if(!await validatePassword(req.query.password)) return res.status(404).json({ message: `Пароль указан неверно.` });

            res.send(await dbManager.query(`SELECT * FROM history`));
        });

        this.#router.post("/restore", async (req, res) => {
            if(!req.body || !req.body.password || !req.body.id) return res.status(406).json({ message: `Данные не отправлены.` });

            if(!await validatePassword(req.body.password)) return res.status(404).json({ message: `Пароль указан неверно.` });

            const history = (await dbManager.query(`SELECT * FROM history WHERE id=${ req.body.id }`))[0];
            if(history.restored) return res.status(404).json({ message: `Изменения уже отменены.` });

            await dbManager.query(history.restore);
            await dbManager.query(`UPDATE history SET restored=true WHERE id=${ history.id }`)
            history.restored = true;

            res.send(history);
        });
    }
}

module.exports = new HistoryRouter();
