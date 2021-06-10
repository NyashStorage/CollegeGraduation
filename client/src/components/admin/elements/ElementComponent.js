import React, { useState, useContext, useEffect } from "react";
import { Helmet } from "react-helmet";

import { APIContext } from "../../../contexts/APIContext";
import { AuthContext } from "../../../contexts/AuthContext";

export const ElementComponent = ({ history, match, type }) => {
    const [element, setElement] = useState(undefined);
    const [fields, setFields] = useState({ translate: "" });

    const { request } = useContext(APIContext);
    const { password } = useContext(AuthContext);

    async function submit(e) {
        e.preventDefault();

        const form = Array.from(new FormData(e.target).entries());
        const data = { };
        form.forEach((item) => { data[item[0]] = item[1] });
        data["password"] = password;
        if(type === "update") data["id"] = element.id;

        const ans = await request(`api/${ match.params.category }/${ type }`, "POST", data);
        if(!ans) return;

        history.push(`/admin/${ match.params.category }`);
    }

    useEffect(() => {
        (async () => {
            const fields = await request(`api/fields/${ match.params.category }`);
            if(!fields) return history.push("/");

            setFields(fields);
            setTimeout(() =>
                window.M.Datepicker.init(document.querySelectorAll(".datepicker"), {
                format: "dd.mm.yyyy",
                i18n: {
                    cancel: "Отменить",
                    done: "Выбрать",
                    months: [
                        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
                    ],
                    monthsShort: [
                        "Янв", "Фев", "Март", "Апр", "Май", "Июнь", "Июль", "Авг", "Сент", "Окт", "Нояб", "Дек"
                    ],
                    weekdays: [
                        "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"
                    ],
                    weekdaysShort: [
                        "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"
                    ],
                    weekdaysAbbrev: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
                }
            })
            , 5);

            if(type !== "update") return;

            const elem = await request(`api/${ match.params.category }/get?id=${ match.params.id }`);
            if(elem.length === 0) return history.push(`/admin/${ match.params.category }`);
            if(Object.keys(elem[0]).length > 0) setElement(elem[0]);
        })();
    }, [request, type, match.params.category, match.params.id, history]);

    return (
        <>
            <Helmet title={ `${ type === "update" ? "Изменить" : "Добавить" } элемент < Политехнический колледж БГТУ` }/>
            <div className="normal">{ type === "update" ? "Изменить" : "Добавить" } элемент</div>
            <form onSubmit={ submit }>
                { fields.database?.map(field => {
                    if(type === "update" && !element) return <React.Fragment key={ Math.random() }/>;

                    if(field.type === "BOOLEAN") return <p key={ field.name }>
                        <label>
                            <input
                                name={ field.name }
                                id={ field.name }
                                type="checkbox"
                                defaultChecked={ element ? element[field.name] : false }
                            />
                            <span>{ fields.translate[field.name] }</span>
                        </label>
                    </p>

                    if(field.type === "LONG") {
                        if(element) setTimeout(() =>
                            window.M.Datepicker
                                .getInstance(document.querySelector(`#${ field.name }`))
                                ?.setDate(new Date(element[field.name]))
                        , 800);

                        return <input
                            name={ field.name }
                            id={ field.name }
                            type="text"
                            placeholder={ fields.translate[field.name] }
                            className="datepicker"
                            key={ field.name }
                            required
                        />
                    }

                    setTimeout(() =>
                        window.M.textareaAutoResize(document.querySelector(`#${ field.name }`))
                    , 5);

                    return <div className="input-field" key={ field.name }>
                        <textarea
                            name={ field.name }
                            id={ field.name }
                            className="materialize-textarea"
                            placeholder={ fields.translate[field.name] }
                            defaultValue={ element ? element[field.name].replace(/<br>/g, "\n") : "" }
                            required
                        />
                    </div>
                }) }
                <button type="submit">
                    <i className="material-icons left">{ type === "update" ? "edit" : "add" }</i> { type === "update" ? "Изменить" : "Создать" }
                </button>
            </form>
        </>
    );
}
