class Database {
    #db;

    /**
     * Подключиться к базе данных.
     * @param file Ссылка на файл (можно относительную).
     * @throws {Error} Возникшая ошибка.
     * @returns {Promise<Database>}
     */
    constructor(file) {
        return new Promise((resolve, reject) => {
            this.#db = new (require("sqlite3").verbose()).Database(file, (e) => {
                if(e) return reject(e);

                resolve(this)
            });
        });
    }

    /**
     * Асинхронно выполнить запрос в базе данных.
     * @param query SQL запрос.
     * @throws {Error} Возникшая ошибка.
     * @returns {Promise<Array>}
     */
    query(query) {
        return new Promise((resolve, reject) => {
            this.#db.all(query, (e, rows) => {
                if(e) return reject(e);

                resolve(rows);
            })
        });
    }

    /**
     * Закрыть соединние с базой данных.
     */
    close() {
        this.#db.close();
    }
}

module.exports = Database;