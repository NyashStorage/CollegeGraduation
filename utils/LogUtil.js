const date = require("moment")();

/**
 * Отправить в консоль сообщение со временем отправки.
 * @param message Сообщение.
 */
function log(message) {
    console.log(`[${ date.format("DD.MM.YY HH:mm:ss") }] [!] ${ message }`);
}

/**
 * Отправить в консоль сообщение о ошибке.
 * @param error Экземпляр ошибки.
 * @param exit Остановить ли выполнение приложеия.
 */
function error(error, exit = false) {
    log(`Произошла ошибка: ${ error.message }\n\tStacktrace: ${ error.stack }.`);
    if(exit) process.exit(1);
}

module.exports = { log, error };
