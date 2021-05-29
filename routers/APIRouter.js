const { Router } = require("express");

class APIRouter {
    #router = new Router();
    getRouter() {
        return this.#router;
    }

    constructor() {
        this.#router.use("/password", (require("./PasswordRouter")).getRouter());
        this.#router.use("/fields", (require("./FieldsRouter")).getRouter());

        this.#router.use("/menu", (require("./MenuRouter")).getRouter());
        this.#router.use("/pages", (require("./PageRouter")).getRouter());
        this.#router.use("/staff", (require("./StaffRouter")).getRouter());
        this.#router.use("/history", (require("./HistoryRouter")).getRouter());

        this.#router.use("/notifications", (require("./NotificationRouter")).getRouter());
        this.#router.use("/links", (require("./LinkRouter")).getRouter());

        this.#router.all("*", (req, res) =>
            res.status(404).json({ "message": "Ссылка API не найдена." })
        );
    }
}

module.exports = new APIRouter();
