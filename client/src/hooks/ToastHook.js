import { useCallback } from "react";

export const useToast = () => {
    /**
     * Отправить уведомление ( необходим Materialize ).
     * @param message Сообщение уведомления.
     */
    return useCallback((message) => {
        if(window.M && message) window.M.toast({ html: message });
    }, []);
};
