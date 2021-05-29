const express = require("express");
const { log } = require("./utils/LogUtil");
const { backendPort } = require("./client/src/configs/config");

const dbManager = new (require("./managers/DBManager"));
module.exports = { dbManager };

/**
 * Установка опций для корректной работы запросов.
 */
const app = express();
app.use(express.json({ extended: true }));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");

    next();
});

/**
 * Подключение роутинга для API.
 */
app.use("/api", (require("./routers/APIRouter")).getRouter());

/**
 * Запуск API приложения с подключением базы данных.
 */
setTimeout(async () => {
    await dbManager.init();

    log("Подключение к базе данных установлено.");

    app.listen(backendPort, () => log(`API приложения запущено на порту ${ backendPort }.`));
});
