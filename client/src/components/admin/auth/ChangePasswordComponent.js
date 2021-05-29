import React, { useContext } from "react";
import { Helmet } from "react-helmet";
import * as md5 from "md5";

import { APIContext } from "../../../contexts/APIContext";
import { AuthContext } from "../../../contexts/AuthContext";

export const ChangePasswordComponent = () => {
    const { request } = useContext(APIContext);
    const { logout } = useContext(AuthContext);

    async function changePassword(e) {
        e.preventDefault();

        const form = Array.from(new FormData(e.target).entries());
        const data = { };
        form.forEach((item) => { data[item[0]] = item[1] });
        data["password"] = md5(data["password"]);
        data["new_password"] = md5(data["new_password"]);
        data["confirmation_password"] = md5(data["confirmation_password"]);

        const ans = await request(`api/password/update`, "POST", data);
        if(!ans) return;

        logout();
    }

    return (
        <>
            <Helmet title="Изменить пароль < Политехнический колледж БГТУ"/>
            <form onSubmit={ changePassword }>
                <div className="input-field">
                    <i className="material-icons prefix">vpn_key</i>
                    <input name="password" id="password" type="password" placeholder="Текущий пароль" required/>
                </div>
                <div className="input-field">
                    <i className="material-icons prefix">cached</i>
                    <input name="new_password" id="new_password" type="password" placeholder="Новый пароль" required/>
                </div>
                <div className="input-field">
                    <i className="material-icons prefix">beenhere</i>
                    <input name="confirmation_password" id="confirmation_password" type="password" placeholder="Подтверждение пароля" required/>
                </div>
                <button type="submit">
                    <i className="material-icons left">send</i> Изменить
                </button>
            </form>
        </>
    );
};
