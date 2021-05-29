const { Router } = require("express");
const { dbManager } = require("../app");
const { validatePassword } = require("../managers/PasswordManager");
const { addHistory } = require("../managers/HistoryManager");

class PageRouter {
    #router = new Router();
    getRouter() {
        return this.#router;
    }

    constructor() {
        this.#router.get("/get", async (req, res) => {
            if(req.query.id) return res.send(await dbManager.query(`SELECT * FROM pages WHERE id=${ req.query.id }`));

            res.send(await dbManager.query(`SELECT * FROM pages ${ req.query.link ? `WHERE link='${ req.query.link }'` : "" }`));
        });

        this.#router.post("/create", async (req, res) => {
            if(!req.body || !req.body.link || !req.body.title || !req.body.html)
                return res.status(406).json({ message: `Данные не отправлены.` });

            if(!await validatePassword(req.body.password))
                return res.status(404).json({ message: `Пароль указан неверно.` });

            if(!/^[a-zA-Z0-9_]+$/.test(req.body.link))
                return res.status(400).json({ message: `Ссылка имеет неверный формат. Используйте паттерн "[a-zA-Z0-9_]+".` });

            let menu = req.body?.menu;
            if(menu) {
                if(menu !== "true" && menu !== "false" && menu !== "on" && isNaN(menu))
                    return res.status(400).json({ message: `Параметр "menu" имеет неверный формат. Используйте тип данных Boolean или Number.` });

                menu = isNaN(menu) ? (menu === "true" || menu === "on") : !!Number.parseInt(menu);
            }

            if(await dbManager.exists("pages", ["link"], [req.body.link.toLowerCase()]))
                return res.status(406).json({ message: `Страница с ссылкой "${ req.body.link.toLowerCase() }" уже существует.` });

            const query = `INSERT INTO pages ('title', 'link', 'html', 'menu') VALUES ('${ encodeURIComponent(req.body.title) }', '${ req.body.link.toLowerCase() }', '${ encodeURIComponent(req.body.html) }', ${ menu || 0 })`;
            await dbManager.query(query);

            const page = (await dbManager.query(`SELECT * FROM pages WHERE title='${ encodeURIComponent(req.body.title) }' AND link='${ req.body.link.toLowerCase() }' AND html='${ encodeURIComponent(req.body.html) }' AND menu=${ menu || 0 }`))[0];
            await addHistory(query, `DELETE FROM pages WHERE id=${ page.id }`);

            res.status(201).json(page);
        });

        this.#router.post("/update", async (req, res) => {
            if(!req.body || !req.body.link || !req.body.title || !req.body.html || !req.body.id) return res.status(406).json({ message: `Данные не отправлены.` });

            if(!await validatePassword(req.body.password)) return res.status(404).json({ message: `Пароль указан неверно.` });

            if(!/^[a-zA-Z0-9_]+$/.test(req.body.link))
                return res.status(400).json({ message: `Ссылка имеет неверный формат. Используйте паттерн "[a-zA-Z0-9_]+".` });

            let menu = req.body?.menu;
            if(menu) {
                if(menu !== "true" && menu !== "false" && menu !== "on" && isNaN(menu))
                    return res.status(400).json({ message: `Параметр "menu" имеет неверный формат. Используйте тип данных Boolean или Number.` });

                menu = isNaN(menu) ? (menu === "true" || menu === "on") : !!Number.parseInt(menu);
            }

            const query = `UPDATE pages SET link='${ req.body.link.toLowerCase() }', title='${ encodeURIComponent(req.body.title) }', html='${ encodeURIComponent(req.body.html) }', menu=${ menu || 0 } WHERE id=${ req.body.id }`;
            const page = (await dbManager.query(`SELECT * FROM pages WHERE id=${ req.body.id }`))[0];

            await addHistory(query, `IF EXISTS(SELECT * FROM pages WHERE id=${ page.id }) UPDATE pages SET link='${ page.link.toLowerCase() }', title='${ encodeURIComponent(page.title) }', html='${ encodeURIComponent(page.html) }', menu=${ menu || 0 } WHERE id=${ page.id } ELSE INSERT INTO pages ('title', 'link', 'html', 'menu') VALUES ('${ encodeURIComponent(page.title) }', '${ page.link.toLowerCase() }', '${ encodeURIComponent(page.html) }', ${ menu || 0 })`);
            await dbManager.query(query);

            res.send((await dbManager.query(`SELECT * FROM pages WHERE id=${ page.id }`))[0]);
        });

        this.#router.post("/delete", async (req, res) => {
            if(!req.body || !req.body.password || !req.body.id) return res.status(406).json({ message: `Данные не отправлены.` });

            if(!await validatePassword(req.body.password)) return res.status(404).json({ message: `Пароль указан неверно.` });

            const query = `DELETE FROM pages WHERE id=${ req.body.id }`;
            const page = (await dbManager.query(`SELECT * FROM pages WHERE id=${ req.body.id }`))[0];

            await addHistory(query, `INSERT INTO pages VALUES (${ page.id }, '${ page.link }', '${ page.title }', '${ page.html }', ${ page.menu })`);
            await dbManager.query(query);

            res.send(page);
        });
    }
}

module.exports = new PageRouter();
