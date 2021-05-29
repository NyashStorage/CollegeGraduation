import React, { useState, useContext, useEffect } from "react";

import { APIContext } from "../../contexts/APIContext";
import { ParametersContext } from "../../contexts/ParametersContext";

export const NotificationsComponent = () => {
    const [notifications, setNotificatons] = useState([]);

    const { request } = useContext(APIContext);
    const { isMobile } = useContext(ParametersContext);

    useEffect(() => {
        (async () => {
            setNotificatons((await request("api/notifications/get"))
                .filter(notification => notification.deadline > Date.now()));
        })();
    }, [request]);

    return (
        <>
            { isMobile ? "" :
                <div className="notifications">
                    { notifications.map(notification =>
                        <div dangerouslySetInnerHTML={{__html: notification.message}}
                             key={notification.message}/>
                    ) }
                </div>
            }
        </>
    );
}
