import React, { useState, useContext, useEffect } from "react";
import { Helmet } from "react-helmet";

import { APIContext } from "../contexts/APIContext";

export const CommonPage = ({ match, history }) => {
    const [page, setPage] = useState({ title: "Политехнический колледж БГТУ" });

    const { request } = useContext(APIContext);

    useEffect(() => {
        (async () => {
            const data = await request(`api/pages/get?link=${ match.params.page || "Главная страница" }`);
            if(!data.length) return history.push("/");
            setPage(data[0]);
        })();
    }, [request, history, match]);

    return (
        <>
            <Helmet title={ `${ decodeURIComponent(page.title) } < Политехнический колледж БГТУ` }/>
            <div dangerouslySetInnerHTML={{ __html: decodeURIComponent(page?.html) }}/>
        </>
    );
}
