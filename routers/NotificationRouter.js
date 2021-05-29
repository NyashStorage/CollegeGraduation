const { Router } = require("express");
const { dbManager } = require("../app");
const { validatePassword } = require("../managers/PasswordManager");
const { addHistory } = require("../managers/HistoryManager");

class NotificationRouter {
    #router = new Router();
    getRouter() {
        return this.#router;
    }

    constructor() {
        this.#router.get("/get", async (req, res) => {
            if(req.query.id) return res.send(await dbManager.query(`SELECT * FROM notifications WHERE id=${ req.query.id }`));

            res.send(await dbManager.query(`SELECT * FROM notifications`));
        });

        this.#router.post("/create", async (req, res) => {
            if(!req.body || !req.body.password || !req.body.message || !req.body.deadline) return res.status(406).json({ message: `Данные не отправлены.` });

            if(!await validatePassword(req.body.password)) return res.status(404).json({ message: `Пароль указан неверно.` });

            let deadline = req.body.deadline;
            if(isNaN(deadline)) {
                if(!/([0-9]{2}\.){2}[0-9]{4}/.test(req.body.deadline)) return res.status(404).json({ message: `Параметр "deadline" имеет неверный формат. Используйте тип данных Number или формат "дд.мм.гггг".` });

                const splitted = deadline.split(".");
                deadline = new Date(splitted[2], splitted[1], splitted[0]).getTime();
            }

            const query = `INSERT INTO notifications (message, deadline) VALUES ('${ req.body.message.replace(/\n/g, "<br>") }', ${ deadline })`;
            await dbManager.query(query);

            const notification = (await dbManager.query(`SELECT * FROM notifications WHERE message='${ req.body.message.replace(/\n/g, "<br>") }' AND deadline=${ deadline }`))[0];
            await addHistory(query, `DELETE FROM links WHERE id=${ notification.id }`);

            res.status(201).json(notification);
        });

        this.#router.post("/update", async (req, res) => {
            if(!req.body || !req.body.password || !req.body.message || !req.body.deadline || !req.body.id) return res.status(406).json({ message: `Данные не отправлены.` });

            if(!await validatePassword(req.body.password)) return res.status(404).json({ message: `Пароль указан неверно.` });

            let deadline = req.body.deadline;
            if(isNaN(deadline)) {
                if(!/([0-9]{2}\.){2}[0-9]{4}/.test(req.body.deadline)) return res.status(404).json({ message: `Параметр "deadline" имеет неверный формат. Используйте тип данных Number или формат "дд.мм.гггг".` });

                const splitted = deadline.split(".");
                deadline = new Date(splitted[2], splitted[1] - 1, splitted[0]).getTime();
            }

            const query = `UPDATE notifications SET message='${ req.body.message.replace(/\n/g, "<br>") }', deadline=${ deadline } WHERE id=${ req.body.id }`;
            const notification = (await dbManager.query(`SELECT * FROM notifications WHERE id=${ req.body.id }`))[0];

            await addHistory(query, `IF EXISTS(SELECT * FROM notifications WHERE id=${ notification.id }) UPDATE links SET message='${ notification.message }', deadline=${ notification.deadline } WHERE id=${ notification.id } ELSE INSERT INTO notifications (message, deadline) VALUES ('${ notification.message }', ${ notification.deadline })`);
            await dbManager.query(query);

            res.send((await dbManager.query(`SELECT * FROM notifications WHERE id=${ notification.id }`))[0]);
        });

        this.#router.post("/delete", async (req, res) => {
            if(!req.body || !req.body.password || !req.body.id) return res.status(406).json({ message: `Данные не отправлены.` });

            if(!await validatePassword(req.body.password)) return res.status(404).json({ message: `Пароль указан неверно.` });

            const query = `DELETE FROM notifications WHERE id=${ req.body.id }`;
            const notification = (await dbManager.query(`SELECT * FROM notifications WHERE id=${ req.body.id }`))[0];

            await addHistory(query, `INSERT INTO notifications VALUES (${ notification.id }, '${ notification.message }', ${ notification.deadline })`);
            await dbManager.query(query);

            res.send(notification);
        });
    }
}

module.exports = new NotificationRouter();
