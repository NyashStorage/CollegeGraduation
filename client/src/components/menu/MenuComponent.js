import React, { useState, useEffect, useContext } from "react";

import { AuthContext } from "../../contexts/AuthContext";
import { ParametersContext } from "../../contexts/ParametersContext";
import { APIContext } from "../../contexts/APIContext";

import { LazyLink } from "../common/LazyLink";

export const MenuComponent = () => {
    const auth = useContext(AuthContext);
    const { isMobile } = useContext(ParametersContext);
    const { request } = useContext(APIContext);

    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => {
        (async () => {
            let menu = [
                { title: "Главная", link: "/" },
                { title: "Персонал колледжа", link: "staff" }
            ];

            const data = await request("api/menu/get");
            if(data) menu = menu.concat(data);

            if(!!auth.password) menu = menu.concat([
                { title: "История изменений", link: "admin/history" },
                { title: "Управление уведомлениями", link: "admin/notifications" },
                { title: "Управление страницами", link: "admin/pages" },
                { title: "Управление персоналом", link: "admin/staff" },
                { title: "Управление ссылками", link: "admin/links" },
                { title: "Смена пароля", link: "admin/password" },
                { title: "Выйти", click: () => auth.logout() }
            ]);

            setMenuItems(menu);
        })();
    }, [request, auth]);

    return (
        <>
            <nav className={ isMobile ? "sidenav" : "" }>
                { menuItems.map(item =>
                    <LazyLink
                        title={ decodeURIComponent(item.title) }
                        link={ item.link }
                        click={ item.click }
                        line={ true }
                        key={ item.title }
                    />
                ) }
            </nav>

            { !isMobile ? "" :
                <aside className="fixed-action-btn">
                    <div className="btn-floating btn-large" onClick={ () => window.M.Sidenav.getInstance(document.querySelector(".sidenav")).open() }>
                        <i className="material-icons">dehaze</i>
                    </div>
                </aside>
            }
        </>
    );
};
