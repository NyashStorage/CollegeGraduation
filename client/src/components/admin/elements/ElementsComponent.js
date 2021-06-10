import React, { useState, useContext, useEffect } from "react";
import { Helmet } from "react-helmet";

import { APIContext } from "../../../contexts/APIContext";
import { AuthContext } from "../../../contexts/AuthContext";
import { useNavigation } from "../../../hooks/NavigationHook";

import { LoadingComponent } from "../../common/LoadingComponent";
import { LazyLink } from "../../common/LazyLink";

import date from "dateformat";

export const ElementsComponent = ({ history, match }) => {
    const [elements, setElements] = useState([]);
    const [fields, setFields] = useState({ translate: "" });

    const { request } = useContext(APIContext);
    const { password } = useContext(AuthContext);
    const navigation = useNavigation();

    function search(e) {
        const search = e.target.value.toLowerCase();
        const trs = document.getElementsByTagName("tbody")[0].getElementsByTagName("tr");

        let find = false;
        for(const tr of trs) {
            tr.classList.add("hide");
            const tds = tr.getElementsByTagName("td");
            for(const td of tds)
                if(td.innerText.toLowerCase().includes(search)) {
                    tr.classList.remove("hide"); find = true;
                }
        }

        if(!find) document.getElementsByClassName("empty")[0].classList.remove("hide");
        else document.getElementsByClassName("empty")[0].classList.add("hide");
    }

    async function remove(id) {
        if(!await request(`api/${ match.params.category }/delete`, "POST", { id, password })) return;

        setElements(elements.filter(elem => elem.id !== id));
    }

    useEffect(() => {
        setElements([]);

        (async () => {
            const elements = await request(`api/${ match.params.category }/get`);
            if(!elements) return history.push("/");

            setElements(elements);
            setFields(await request(`api/fields/${ match.params.category }`));
        })();
    }, [request, match, history]);

    return (
        <>
            <Helmet title={ `${ fields?.translate[match.params.category] || "Загрузка" } < Политехнический колледж БГТУ` }/>
            <div className="search">
                <div className="normal">{ fields?.translate[match.params.category] }</div>
                <div className="input-field">
                    <input
                        type="text"
                        placeholder="Поиск"
                        onChange={ (e) => search(e) }
                    />
                </div>
            </div>
            { !elements.length ?
                <div className="loader">
                    <LoadingComponent/>
                </div> :
                <table className="highlight centered">
                    <thead>
                        <tr>
                            { fields.fields?.map(field => <th key={ field }>{ fields.translate[field] }</th>) }
                            <th>Удалить</th>
                        </tr>
                    </thead>
                    <tbody>
                        { elements.map(elem =>
                            <tr key={ elem.id }>
                                { Object.entries(elem).map((e) => {
                                    let value;

                                    if(fields.database?.filter(elem => elem.name === e[0])[0]?.type === "BOOLEAN")
                                        value = <i className="material-icons">{ e[1] ? "done" : "close" }</i>
                                    else if(fields.database?.filter(elem => elem.name === e[0])[0]?.type === "LONG")
                                        value = <>{ date(new Date(e[1]), "dd.mm.yyyy") }</>
                                    else value = <span>{ decodeURIComponent(e[1]) }</span>;

                                    return !fields.fields?.includes(e[0]) ? <React.Fragment key={ Math.random() }/> :
                                        <td onClick={ () => navigation.lazyOpen(`admin/${ match.params.category }/${ elem.id }`) } key={ elem.id + e[1] }>{ value }</td>
                                }) }
                                {
                                    match.params.category === "pages" && elem?.link === "Главная страница" ?
                                        <td>
                                            <i className="material-icons">cancel</i>
                                        </td> :
                                        <td className="hoverable" onClick={ () => remove(elem.id) }>
                                            <i className="material-icons">delete</i>
                                        </td>
                                }
                            </tr>)
                        }
                        <tr className="empty hide">
                            <td colSpan={ fields.fields?.length + 1 || 0 }>
                                Ничего не найдено
                            </td>
                        </tr>
                    </tbody>
                </table>
            }
            <div className="container">
                <LazyLink
                    title={ <><i className="material-icons large">add</i> Добавить</> }
                    link={ `admin/${ match.params.category }/create` }
                    classes="btn"
                />
            </div>
        </>
    );
}
