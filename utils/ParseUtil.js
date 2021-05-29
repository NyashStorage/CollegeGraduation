/**
 * Получить HTML код страницы.
 * @param url Ссылка на страницу.
 */
async function getHTML(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith("https") ? require("https") : require("http");

        client.get(url, (res) => {
            let data = "";

            res.on("data", (chunk) => data += chunk)
                .on("end", () => resolve(data))
        }).on("error", (e) => reject(e));
    });
}

/**
 * Получить основную информацию о работнике колледжа.
 * @param url Ссылка на страницу работника с сайта БГТУ.
 * @return Объект с данными о работнике в формате: { initials: "ФИО", photo: "Ссылка на фотографию" }
 */
async function parseStaffData(url) {
    const initialsRegex = /class="userpage-title">([А-Яа-я ]+)/m;
    const photoRegex = /photo" alt="" src="(.+)"/m;
    const html = await getHTML(url);

    if(html instanceof Error) return { initials: "Ошибка", photo: "" };

    const initials = initialsRegex.exec(html)[1];
    const photo = `https://www.tu-bryansk.ru${ photoRegex.exec(html)[1] }`;

    return { initials, photo };
}

module.exports = { getHTML, parseStaffData };
