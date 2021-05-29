import React, { useContext } from "react";
import { Helmet } from "react-helmet";
import { AuthContext } from "../../../contexts/AuthContext";
import * as md5 from "md5";

export const AuthComponent = () => {
    const auth = useContext(AuthContext);
    function authenticate(e) {
        e.preventDefault();

        const form = Array.from(new FormData(e.target).entries());
        const data = { };
        form.forEach((item) => { data[item[0]] = item[1] });
        data["password"] = md5(data["password"]);

        auth.login(data);
    }

    return (
        <>
            <Helmet title="Авторизация < Политехнический колледж БГТУ"/>
            <form onSubmit={ authenticate }>
                <div className="input-field">
                    <i className="material-icons prefix">vpn_key</i>
                    <input name="password" id="password" type="password" placeholder="Пароль" required/>
                </div>
                <button type="submit">
                    <i className="material-icons left">send</i> Авторизоваться
                </button>
            </form>
        </>
    );
};
