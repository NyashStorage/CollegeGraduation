const { Router } = require("express");
const { dbManager } = require("../app");
const { parseStaffData } = require("../utils/ParseUtil");
const { validatePassword } = require("../managers/PasswordManager");
const { addHistory } = require("../managers/HistoryManager");

class StaffRouter {
    #router = new Router();
    getRouter() {
        return this.#router;
    }

    constructor() {
        this.#router.get("/get", async (req, res) => {
            if(req.query.id) return res.send(await dbManager.query(`SELECT * FROM staff WHERE id=${ req.query.id }`));

            let senior = req.query?.senior;
            if(senior) {
                if(senior !== "true" && senior !== "false" && isNaN(senior))
                    return res.status(400).json({ message: `Параметр "senior" имеет неверный формат. Используйте тип данных Boolean или Number.` });

                senior = isNaN(senior) ? senior === "true" : !!Number.parseInt(senior);

                return res.send(await this.#createEmployee(await dbManager.query(`SELECT * FROM staff WHERE senior=${ senior }`)));
            }

            res.send(await this.#createEmployee(await dbManager.query("SELECT * FROM staff")));
        });

        this.#router.post("/create", async (req, res) => {
            if(!req.body || !req.body.link || !req.body.duty) return res.status(406).json({ message: `Данные не отправлены.` });

            if(!await validatePassword(req.body.password)) return res.status(404).json({ message: `Пароль указан неверно.` });

            let senior = req.body?.senior;
            if(senior) {
                if(senior !== "true" && senior !== "false" && senior !== "on" && isNaN(senior))
                    return res.status(400).json({ message: `Параметр "senior" имеет неверный формат. Используйте тип данных Boolean или Number.` });

                senior = isNaN(senior) ? (senior === "true" || senior === "on") : !!Number.parseInt(senior);
            }

            const query = `INSERT INTO staff (link, duty, senior) VALUES ('${ req.body.link }', '${ req.body.duty }', '${ senior || 0 }')`;
            await dbManager.query(query);

            const employee = (await dbManager.query(`SELECT * FROM staff WHERE link='${ req.body.link }' AND duty='${ req.body.duty }'`))[0];
            await addHistory(query, `DELETE FROM staff WHERE id=${ employee.id }`);

            res.status(201).json(employee);
        });

        this.#router.post("/update", async (req, res) => {
            if(!req.body || !req.body.link || !req.body.duty || !req.body.id) return res.status(406).json({ message: `Данные не отправлены.` });

            if(!await validatePassword(req.body.password)) return res.status(404).json({ message: `Пароль указан неверно.` });

            let senior = req.body?.senior;
            if(senior) {
                if(senior !== "true" && senior !== "false" && senior !== "on" && isNaN(senior))
                    return res.status(400).json({ message: `Параметр "senior" имеет неверный формат. Используйте тип данных Boolean или Number.` });

                senior = isNaN(senior) ? (senior === "true" || senior === "on") : !!Number.parseInt(senior);
            }

            const query = `UPDATE staff SET link='${ req.body.link }', duty='${ req.body.duty }', senior='${ senior || 0 }' WHERE id=${ req.body.id }`;
            const employee = (await dbManager.query(`SELECT * FROM staff WHERE id=${ req.body.id }`))[0];

            await addHistory(query, `IF EXISTS(SELECT * FROM staff WHERE id=${ employee.id }) UPDATE staff SET link='${ employee.link }', duty='${ employee.duty }', senior='${ employee.senior }' WHERE id=${ employee.id } ELSE INSERT INTO staff (link, duty, senior) VALUES ('${ employee.link }', '${ employee.duty }', '${ employee.senior }')`);
            await dbManager.query(query);

            res.send((await dbManager.query(`SELECT * FROM staff WHERE id=${ employee.id }`))[0]);
        });

        this.#router.post("/delete", async (req, res) => {
            if(!req.body || !req.body.password || !req.body.id) return res.status(406).json({ message: `Данные не отправлены.` });

            if(!await validatePassword(req.body.password)) return res.status(404).json({ message: `Пароль указан неверно.` });

            const query = `DELETE FROM staff WHERE id=${ req.body.id }`;
            const employee = (await dbManager.query(`SELECT * FROM staff WHERE id=${ req.body.id }`))[0];

            await addHistory(query, `INSERT INTO staff VALUES (${ employee.id }, '${ employee.link }', '${ employee.duty }', ${ employee.senior })`);
            await dbManager.query(query);

            res.send(employee);
        });
    }

    async #createEmployee(dbData) {
        return await Promise.all(
            dbData.map(async (employee) => {
                const data = await parseStaffData(employee.link);
                return { ...data, ...employee };
            })
        );
    }
}

module.exports = new StaffRouter();
