const { Router } = require("express");
const { dbManager } = require("../app");

class FieldsRouter {
    #router = new Router();
    getRouter() {
        return this.#router;
    }

    constructor() {
        this.#router.get("/:table", async (req, res) => {
            const tableFields = [
                {
                    table: "links",
                    fields: [ "link", "photo", "title" ],
                    translate: { links: "Управление ссылками", link: "Ссылка", photo: "Изображение", title: "Заголовок" }
                },
                {
                    table: "notifications",
                    fields: [ "message", "deadline" ],
                    translate: { notifications: "Управление уведомлениями", message: "Текст уведомления", deadline: "Исчезнет" }
                },
                {
                    table: "pages",
                    fields: [ "link", "title", "menu" ],
                    translate: { pages: "Управление страницами", link: "Ссылка", title: "Заголовок", html: "Код", css: "Стиль", menu: "В меню" }
                },
                {
                    table: "staff",
                    fields: [ "link", "duty", "senior" ],
                    translate: { staff: "Управление персоналом", link: "Ссылка", duty: "Должность", senior: "Управляющий" }
                }
            ];

            const info = tableFields.filter(elem => elem.table === req.params.table)[0];
            delete info.table;

            info.database = (await dbManager.query(`PRAGMA table_info(${ req.params.table })`))
                .splice(1)
                .map(field => {
                    return { name: field.name, type: field.type }
                });

            return res.send(info);
        });
    }
}

module.exports = new FieldsRouter();
