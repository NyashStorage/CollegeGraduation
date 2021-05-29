import React from "react";
import { useNavigation } from "../../hooks/NavigationHook";

export const LazyLink = ({ title, link = "", classes = "", click, line = false }) => {
    const navigation = useNavigation();

    return (
        <>
            <div className={ classes } onClick={ click || (() => navigation.lazyOpen(link)) }>
                { title || "" }
            </div>
            { !line ? "" : <div className="line"/> }
        </>
    );
}
