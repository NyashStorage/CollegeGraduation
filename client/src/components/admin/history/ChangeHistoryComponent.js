import React, { useState, useContext, useCallback, useEffect } from "react";
import { Helmet } from "react-helmet";

import { APIContext } from "../../../contexts/APIContext";
import { AuthContext } from "../../../contexts/AuthContext";

import date from "dateformat";

export const ChangeHistoryComponent = () => {
    const [history, setHistory] = useState([]);

    const { request } = useContext(APIContext);
    const { password } = useContext(AuthContext);

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

    const updateHistory = useCallback(async () => {
        setHistory((await request(`api/history/get?password=${ password }`))?.reverse());
        window.M.Tooltip.init(document.querySelectorAll(".tooltipped"), { });
    }, [request, password]);

    async function restore(id) {
        await request(`api/history/restore`, "POST", { password, id });
        await updateHistory();
    }

    useEffect(() => updateHistory(), [updateHistory]);

    return (
        <>
            <Helmet title="История изменений < Политехнический колледж БГТУ"/>
            <div className="search">
                <div className="normal">История изменений</div>
                <div className="input-field">
                    <input
                        type="text"
                        placeholder="Поиск"
                        onChange={ (e) => search(e) }
                    />
                </div>
            </div>
            { !history.length ?
                <div className="loader normal valign">
                    <i className="material-icons">cancel</i> Ничего не найдено
                </div> :
                <table className="highlight centered">
                    <thead>
                        <tr>
                            <th>Дата</th>
                            <th>Запрос</th>
                            <th>Восстановить</th>
                        </tr>
                    </thead>
                    <tbody>
                        { history.map(elem => <tr key={ elem.id }>
                                <td>{ date(new Date(elem.date), "dd.mm.yyyy hh:MM:ss") }</td>
                                <td
                                    className="tooltipped"
                                    data-position="bottom"
                                    data-tooltip={
                                        decodeURIComponent(decodeURIComponent(elem.restore)).length > 150 ?
                                        decodeURIComponent(decodeURIComponent(elem.restore)).substring(0, 150) + "..." :
                                        decodeURIComponent(decodeURIComponent(elem.restore))
                                    }
                                ><span>{ decodeURIComponent(elem.query) }</span></td>
                                <td
                                    className={ elem.restored ? "" : "hoverable" }
                                    onClick={ elem.restored ? () => { } : () => restore(elem.id) }
                                >
                                    <i className="material-icons">{ elem.restored ? "cancel" : "low_priority" }</i>
                                </td>
                            </tr>
                        ) }
                        <tr className="empty hide">
                            <td colSpan={ 3 }>
                                Ничего не найдено
                            </td>
                        </tr>
                    </tbody>
                </table>
            }
        </>
    );
}
