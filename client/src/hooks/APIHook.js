import { useState, useCallback } from "react";
const { apiHost, backendPort } = require("../configs/config");

export const useAPI = () => {
    const [error, setError] = useState(null);
    const clearError = useCallback(() => setError(null), []);

    /**
     * Отправить запрос по адресу.
     * @param url Адрес отправки запроса.
     * @param method Метод отправки запроса.
     * @param body Тело запроса.
     * @param headers Головные теги запроса.
     */
    const request = useCallback(async (url, method = "GET", body = null, headers = { }) => {
        try {
            const response = await fetch(`http://${ apiHost }:${ backendPort }/${url}`, { method,
                body: (body ? JSON.stringify(body) : null),
                headers: (body ? { ...headers, "Content-Type": "application/json" } : { ...headers })
            });
            const data = await response.json();

            if(!response.ok) return setError(data.message || "Произошла какая-то ошибка..");

            return data;
        } catch (e) { setError(e.message); }
    }, []);

    return { request, error, clearError };
};
