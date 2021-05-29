const { Router } = require("express");
const { dbManager } = require("../app");
const { validatePassword } = require("../managers/PasswordManager");
const { addHistory } = require("../managers/HistoryManager");

class LinkRouter {
    #router = new Router();
    getRouter() {
        return this.#router;
    }

    constructor() {
        this.#router.get("/get", async (req, res) => {
            if(req.query.id) return res.send(await dbManager.query(`SELECT * FROM links WHERE id=${ req.query.id }`));

            res.send(await dbManager.query(`SELECT * FROM links`));
        });

        this.#router.post("/create", async (req, res) => {
            if(!req.body || !req.body.password || !req.body.link || !req.body.photo || !req.body.title) return res.status(406).json({ message: `Данные не отправлены.` });

            if(!await validatePassword(req.body.password)) return res.status(404).json({ message: `Пароль указан неверно.` });

            const query = `INSERT INTO links (link, photo, title) VALUES ('${ req.body.link }', '${ req.body.photo }', '${ req.body.title }')`;
            await dbManager.query(query);

            const link = (await dbManager.query(`SELECT * FROM links WHERE link='${ req.body.link }' AND photo='${ req.body.photo }' AND title='${ req.body.title }'`))[0];
            await addHistory(query, `DELETE FROM links WHERE id=${ link.id }`);

            res.status(201).json(link);
        });

        this.#router.post("/update", async (req, res) => {
            if(!req.body || !req.body.password || !req.body.link || !req.body.photo || !req.body.title || !req.body.id) return res.status(406).json({ message: `Данные не отправлены.` });

            if(!await validatePassword(req.body.password)) return res.status(404).json({ message: `Пароль указан неверно.` });

            const query = `UPDATE links SET link='${ req.body.link }', photo='${ req.body.photo }', title='${ req.body.title }' WHERE id=${ req.body.id }`;
            const link = (await dbManager.query(`SELECT * FROM links WHERE id=${ req.body.id }`))[0];

            await addHistory(query, `IF EXISTS(SELECT * FROM links WHERE id=${ link.id }) UPDATE links SET link='${ link.link }', photo='${ link.photo }', title='${ link.title }' WHERE id=${ link.id } ELSE INSERT INTO links (link, photo, title) VALUES ('${ link.link }', '${ link.photo }', '${ link.title }')`);
            await dbManager.query(query);

            res.send((await dbManager.query(`SELECT * FROM links WHERE id=${ req.body.id }`))[0]);
        });

        this.#router.post("/delete", async (req, res) => {
            if(!req.body || !req.body.password || !req.body.id) return res.status(406).json({ message: `Данные не отправлены.` });

            if(!await validatePassword(req.body.password)) return res.status(404).json({ message: `Пароль указан неверно.` });

            const query = `DELETE FROM links WHERE id=${ req.body.id }`;
            const link = (await dbManager.query(`SELECT * FROM links WHERE id=${ req.body.id }`))[0];

            await addHistory(query, `INSERT INTO links VALUES (${ link.id }, '${ link.link }', '${ link.photo }', '${ link.title }')`);
            await dbManager.query(query);

            res.send(link);
        });
    }
}

module.exports = new LinkRouter();
