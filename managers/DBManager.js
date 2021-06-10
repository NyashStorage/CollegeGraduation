const { error } = require("../utils/LogUtil");

class DBManager {
    /**
     * Подключиться к базе данных и создать файл, если он не найден.
     */
    async init() {
        try {
            const db = await new (require("../classes/Database"))("./databases/database.db");
            this.db = db;

            await db.query("CREATE TABLE IF NOT EXISTS variables ('id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 'variable' TEXT NOT NULL, 'value' TEXT NOT NULL)");
            if(!(await this.exists("variables", ["variable"], ["password"])))
                await db.query("INSERT INTO variables (variable, value) VALUES ('password', '5f4dcc3b5aa765d61d8327deb882cf99')");

            await db.query("CREATE TABLE IF NOT EXISTS history ('id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 'query' TEXT NOT NULL, 'restore' TEXT NOT NULL, 'date' LONG NOT NULL, 'restored' BOOLEAN DEFAULT 0)");

            await db.query("CREATE TABLE IF NOT EXISTS pages ('id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 'link' TEXT NOT NULL, 'title' TEXT NOT NULL, 'html' TEXT NOT NULL, 'menu' BOOLEAN NOT NULL)");
            if(!(await this.size("pages"))) {
                // TODO: Создать базовые страницы сайта.
                await db.query("INSERT INTO pages (link, title, html, menu) VALUES ('Главная страница', 'Главная страница', 'Главная страница (редактируется из панели администратора)', '0')");
                await db.query("INSERT INTO pages (link, title, html, menu) VALUES ('test', 'Тестовая страница', 'Тестовая страница (редактируется из панели администратора)', '1')");
            }

            await db.query("CREATE TABLE IF NOT EXISTS notifications ('id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 'message' TEXT NOT NULL, 'deadline' LONG NOT NULL)");
            if(!(await this.size("notifications")))
                await db.query("INSERT INTO notifications (message, deadline) VALUES ('ВНИМАНИЕ! Изменились реквизиты для оплаты.<br><br>С 1 января 2021 года изменились реквизиты  для оплаты обучения, за проживание в общежитии, возмещение коммунальных услуг.', 9999999999999)");

            await db.query("CREATE TABLE IF NOT EXISTS links ('id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 'link' TEXT NOT NULL, 'photo' TEXT NOT NULL, 'title' TEXT)");
            if(!(await this.size("links"))) {
                await db.query("INSERT INTO links (link, photo, title) VALUES ('https://minobrnauki.gov.ru/', 'https://www.tu-bryansk.ru/upload/iblock/ee1/1.png', 'Министерство науки и высшего образования РФ')");
                await db.query("INSERT INTO links (link, photo, title) VALUES ('https://gosuslugi.ru/', 'https://www.tu-bryansk.ru/upload/iblock/ca3/gosuslugi.png', 'Портал Госуслуги')");
                await db.query("INSERT INTO links (link, photo, title) VALUES ('http://www.edu.ru/', 'https://www.tu-bryansk.ru/upload/iblock/56f/2.png', 'Федеральный портал российского образования')");
                await db.query("INSERT INTO links (link, photo, title) VALUES ('http://eais.rkn.gov.ru/feedback/', 'https://www.tu-bryansk.ru/upload/iblock/067/roskomnadzor.jpg', 'Единый реестр ресурсов с информацией, распространение которой в РФ запрещено')");
                await db.query("INSERT INTO links (link, photo, title) VALUES ('https://minobrnauki.gov.ru/god-nauki/', 'https://www.tu-bryansk.ru/upload/iblock/d2b/300%D1%85250.png', 'Год науки и технологий')");
                await db.query("INSERT INTO links (link, photo, title) VALUES ('http://fcior.edu.ru/', 'https://www.tu-bryansk.ru/upload/iblock/ce8/3.png', 'Федеральный центр информационно-образовательных ресурсов')");
                await db.query("INSERT INTO links (link, photo, title) VALUES ('http://school-collection.edu.ru/', 'https://www.tu-bryansk.ru/upload/iblock/36f/4.png', 'Единая коллекция цифровых образовательных ресурсов')");
                await db.query("INSERT INTO links (link, photo, title) VALUES ('http://window.edu.ru/', 'https://www.tu-bryansk.ru/upload/iblock/576/5.png', 'Единое окно доступа к информационным ресурсам')");
                await db.query("INSERT INTO links (link, photo, title) VALUES ('http://abitur.tu-bryansk.ru/mainpage/trudoustroystvo', 'https://www.tu-bryansk.ru/upload/iblock/359/6.png', 'Трудоустройство выпускников БГТУ')");
                await db.query("INSERT INTO links (link, photo, title) VALUES ('https://www.oprf.ru/1449/2284/', 'https://www.tu-bryansk.ru/upload/iblock/8ee/7.png', 'Противодействия экстремизму')");
            }

            await db.query("CREATE TABLE IF NOT EXISTS staff ('id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 'link' TEXT NOT NULL, 'duty' TEXT DEFAULT 'Преподаватель', 'senior' BOOLEAN DEFAULT '0')");
            if(!(await this.size("staff"))) {
                await db.query("INSERT INTO staff (link, duty, senior) VALUES ('https://www.tu-bryansk.ru/sveden/employees/209', 'Исполняющий обязанности директора колледжа, заместитель директора по учебно-методической работе', true)");
                await db.query("INSERT INTO staff (link, duty, senior) VALUES ('https://www.tu-bryansk.ru/sveden/employees/6590', 'Заместитель директора по учебно-воспитательной работе', true)");
                await db.query("INSERT INTO staff (link, duty, senior) VALUES ('https://www.tu-bryansk.ru/sveden/employees/544', 'Заместитель директора по учебно-производственной работе', true)");
                await db.query("INSERT INTO staff (link, duty, senior) VALUES ('https://www.tu-bryansk.ru/sveden/employees/543', 'Заместитель директора по хозяйственной работе', true)");

                await db.query("INSERT INTO staff (link, duty) VALUES ('https://www.tu-bryansk.ru/sveden/employees/534', 'Председатель предметно-цикловой комиссии \"Программирование в компьютерных системах\"')");
                await db.query("INSERT INTO staff (link) VALUES ('https://www.tu-bryansk.ru/sveden/employees/4373')");
                await db.query("INSERT INTO staff (link) VALUES ('https://www.tu-bryansk.ru/sveden/employees/524')");
                await db.query("INSERT INTO staff (link) VALUES ('https://www.tu-bryansk.ru/sveden/employees/500')");
            }
        } catch (e) { error(e, 1) }
    }

    /**
     * Асинхронно выполнить запрос в базе данных.
     * @param query SQL запрос.
     * @returns {Array}
     */
    async query(query) {
        try {
            return await this.db.query(query);
        } catch (e) { error(e) }
    }

    /**
     * Асинхронно проверить наличие данных в таблице.
     * @param table Таблица в базе данных.
     * @param keys Массив с названием столбцов для проверки.
     * @param values Массив со значение столбцов для проверки.
     * @throws {Error} Возникшая ошибка.
     * @returns {Boolean} Присутствует ли строка в базе данных.
     */
    async exists(table, keys = [], values = []) {
        if(keys.length !== values.length) throw new Error("Keys and values arrays sizes are not equal.");

        const q = [];
        for(let i = 0; i < keys.length; i++)
            q.push(`${ keys[i] }=${ isNaN(values[i]) ? "'" + values[i] + "'" : values[i] }`);

        return !!(await this.query(`SELECT id FROM ${ table } WHERE ${ q.join(" AND ") }`)).length;
    }

    /**
     * Асинхронно проверить количество записей в таблице.
     * @param table Таблица в базе данных.
     * @throws {Error} Возникшая ошибка.
     * @returns {Number} Число строк в таблице.
     */
    async size(table) {
        return (await this.query(`SELECT id FROM ${ table }`)).length;
    }

    /**
     * Закрыть соединние с базой данных.
     */
    close() {
        this.db.close();
    }
}

module.exports = DBManager;
