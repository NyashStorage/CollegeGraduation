import React from "react";
import { LazyLink } from "../common/LazyLink";

export const EmployeeComponent = ({ employee }) => {
    return (<>{
        employee.notFound ? <i className="animation-in material-icons large">cancel</i> :
            <LazyLink
                title={
                    <>
                        <img src={ employee.photo } alt="Фотография сотрудника"/>
                        <div>
                            <div>{ employee.initials }</div>
                            <div className="line"/>
                            <div>{ employee.duty }</div>
                        </div>
                    </>
                }
                link={ employee.link }
                classes="employee"
            />
    }</>);
};
