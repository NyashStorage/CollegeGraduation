import { useHistory } from "react-router-dom";

export const useNavigation = () => {
    const history = useHistory();

    /**
     * Перенаправить пользователя по ссылке.
     * @param link Ссылка на страницу ( auth, /test, http://vk.com ).
     */
    function open(link) {
        if(history.location.pathname === `${ link.startsWith("/") ? "" : "/" }${ link }`) return;
        if(link.startsWith("http")) return window.open(link);
        return history.push(`${ link.startsWith("/") ? "" : "/" }${ link }`);
    }

    /**
     * Перенаправить пользователя по ссылке с анимацией перехода.
     * @param link Ссылка на страницу ( auth, /test, http://vk.com ).
     */
    function lazyOpen(link) {
        if(history.location.pathname === `${ link.startsWith("/") ? "" : "/" }${ link }`) return;
        if(link.startsWith("http")) return window.open(link);

        const elements = document.querySelectorAll(".animated");
        elements.forEach((elem) => elem.classList.add("animation-out"));

        setTimeout(() => {
            if(link) history.push(`${ link.startsWith("/") ? "" : "/" }${ link }`);
            elements.forEach((elem) => elem.classList.remove("animation-out"));
        }, elements.length > 0 ? 1000 : 0);
    }

    return { open, lazyOpen };
};
