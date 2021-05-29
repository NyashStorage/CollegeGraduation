import { useState, useCallback, useEffect } from "react";

export const useAuth = (request) => {
    const [password, setPassword] = useState(undefined);

    const checkAccount = useCallback(async (data, lazy = true) => {
        const answer = await request("api/password/login", "POST", data);
        if(!answer) return false;

        if(lazy) {
            const elements = document.querySelectorAll(".animated");
            elements.forEach((elem) => elem.classList.add("animation-out"));
            setTimeout(() => setPassword(answer.password), elements.length > 0 ? 1000 : 0);
        } else setPassword(answer.password);

        localStorage.setItem("nmcollege", JSON.stringify(answer));

        return true;
    }, [request]);

    const login = useCallback((data) => checkAccount(data), [checkAccount]);

    const logout = useCallback(() => {
        const elements = document.querySelectorAll(".animated");
        elements.forEach((elem) => elem.classList.add("animation-out"));
        setTimeout(() => setPassword(""), elements.length > 0 ? 1000 : 0);

        localStorage.removeItem("nmcollege");
    }, []);

    useEffect(() => {
        (async () => {
            const password = localStorage.getItem("nmcollege");
            if(!password) return setPassword("");

            if(!await checkAccount(JSON.parse(password), false)) logout();
        })();
    }, [checkAccount, logout]);

    return { login, logout, password };
};
