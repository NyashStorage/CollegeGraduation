import React, { useState, useContext, useEffect } from "react";

import { APIContext } from "../../contexts/APIContext";

export const LinksComponent = () => {
    const [links, setLinks] = useState([]);

    const { request } = useContext(APIContext);

    useEffect(() => {
        (async () => {
            setLinks(await request("api/links/get"));
            window.M.Tooltip.init(document.querySelectorAll(".tooltipped"), { });
        })();
    }, [request]);

    return (
        <>
            <div className="links">
                <span className="left">‹</span>
                <span className="right">›</span>

                <ul className="links-list">
                    { links.map(link =>
                        <li
                            className="tooltipped"
                            data-position="top"
                            data-tooltip={ link.title }
                            key={ link.link }
                        >
                            <a href={ link.link } target="_blank" rel="noreferrer">
                                <img src={ link.photo } alt=""/>
                            </a>
                        </li>
                    )}
                </ul>
            </div>
        </>
    );
}
