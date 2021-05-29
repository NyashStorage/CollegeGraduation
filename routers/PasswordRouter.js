const { Router } = require("express");
const { dbManager } = require("../app");
const { validatePassword } = require("../managers/PasswordManager");

class PasswordRouter {
    #router = Router();
    getRouter() {
        return this.#router;
    }

    constructor() {
        this.#router.post("/login", async (req, res) => {
            if(!req.body || !req.body.password) return res.status(406).json({ message: `Данные не отправлены.` });

            if(!await validatePassword(req.body.password)) return res.status(404).json({ message: `Пароль указан неверно.` });

            return res.send({ password: req.body.password });
        });

        this.#router.post("/update", async (req, res) => {
            if(!req.body || !req.body.password || !req.body.new_password || !req.body.confirmation_password) return res.status(406).json({ message: `Данные не отправлены.` });
            const new_password = req.body.new_password;
            const confirmation_password = req.body.confirmation_password

            if(!await validatePassword(req.body.password)) return res.status(404).json({ message: `Пароль указан неверно.` });
            if(new_password !== confirmation_password) return res.status(404).json({ message: `Пароли не совпадают.` });

            await dbManager.query(`UPDATE variables SET value='${ new_password }' WHERE variable='password'`);

            return res.send({ password: new_password });
        });
    }
}

module.exports = new PasswordRouter();
