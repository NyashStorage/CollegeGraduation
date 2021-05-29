import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { BrowserRouter } from "react-router-dom";

import parallax from "./assets/images/parallax.jpg";

import { ParametersContext } from "./contexts/ParametersContext";
import { APIContext } from "./contexts/APIContext";
import { AuthContext } from "./contexts/AuthContext";

import { useToast } from "./hooks/ToastHook";
import { useAPI } from "./hooks/APIHook";
import { useAuth } from "./hooks/AuthHook";
import { useRoutes } from "./routes";

import { MenuComponent } from "./components/menu/MenuComponent";
import { LazyLink } from "./components/common/LazyLink";
import { NotificationsComponent } from "./components/notifications/NotificationsComponent";
import { LinksComponent } from "./components/links/LinksComponent";

export const App = () => {
    const { request, error, clearError } = useAPI();
    const toast = useToast();
    useEffect(() => {
        toast(error); clearError();
    }, [error, toast, clearError]);

    const { login, logout, password } = useAuth(request);
    const routes = useRoutes(password);

    const [isMobile, setMobile] = useState(window.innerWidth < 993);
    useEffect(() => {
        window.addEventListener("resize", () => {
            const isMobile = window.innerWidth < 993;

            setTimeout(() => {
                if(isMobile)
                    window.M.Sidenav.init(document.querySelector(".sidenav"), { });
                else
                    document.querySelector(".sidenav")?.removeAttribute("style");
            });

            setMobile(isMobile);
        });
    }, []);

    return (
        <BrowserRouter>
            <Helmet title="Главная страница < Политехнический колледж БГТУ"/>
            <ParametersContext.Provider value={{ isMobile }}>
            <APIContext.Provider value={{ request }}>
            <AuthContext.Provider value={{ login, logout, password }}>
                <header>
                    <div className="content-wrapper">
                        <div className="content">
                            <img className="logo" src="https://www.tu-bryansk.ru/local/templates/bstu/img/header/logo.svg" alt="Логотип колледжа"/>
                            <div>
                                Политехнический колледж БГТУ
                                { isMobile ||
                                    <LazyLink
                                        title={ <><i className="material-icons">flag</i> Приёмная комиссия</> }
                                        link="commission"
                                        classes="commission"
                                    />
                                }
                            </div>
                        </div>
                    </div>
                    <div className="parallax-container">
                        <div className="parallax">
                            <img src={ parallax } alt="Вид колледжа"/>
                        </div>
                    </div>
                    { !isMobile ||
                        <LazyLink
                            title={ <><i className="material-icons">flag</i> Приёмная комиссия</> }
                            link="commission"
                            classes="commission mobile"
                        />
                    }
                </header>

                <main>
                    <aside className="panel">
                        <MenuComponent/>
                        <NotificationsComponent/>
                    </aside>

                    <article className="animated">
                        { routes }
                    </article>
                </main>

                <footer>
                    <LinksComponent/>

                    <div className="content-wrapper">
                        <div className="content">
                            © 1994-{ new Date().getFullYear() } Политехнический колледж БГТУ<br/>
                            Все права защищены.
                        </div>
                    </div>
                </footer>
            </AuthContext.Provider>
            </APIContext.Provider>
            </ParametersContext.Provider>
        </BrowserRouter>
    );
};
