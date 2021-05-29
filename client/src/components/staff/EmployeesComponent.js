import React, { useState, useContext, useEffect } from "react";
import { Helmet } from "react-helmet";

import { APIContext } from "../../contexts/APIContext";

import { LoadingComponent } from "../common/LoadingComponent";
import { EmployeeComponent } from "./EmployeeComponent";

export const EmployeesComponent = () => {
    const [seniors, setSeniors] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const { request } = useContext(APIContext);

    function search(e, elements, setter) {
        let data = elements.filter(element => !element.notFound)
            .map(element => {
                element.display = element.initials.toLowerCase().includes(e.target.value.toLowerCase()) || element.duty.toLowerCase().includes(e.target.value.toLowerCase());
                return element;
            });

        if(!data.filter(element => element.display).length)
            data.push({ notFound: true, display: true });
        else data = data.filter(element => !element.notFound);

        setter(data);
    }

    useEffect(() => {
        (async () => {
            const data = await request("api/staff/get");
            if(!data) return;

            setSeniors(data.map(employee => {
                employee.display = true;
                return employee;
            }).filter(employee => employee.senior));

            setTeachers(data.map(employee => {
                employee.display = true;
                return employee;
            }).filter(employee => !employee.senior));
        })();
    }, [request]);

    return (
        <>
            <Helmet title="Персонал < Политехнический колледж БГТУ"/>
            <div className="search">
                <div className="normal">Руководство колледжа</div>
                <div className="input-field">
                    <input
                        id="seniors"
                        type="text"
                        placeholder="Поиск"
                        onChange={ (e) => search(e, seniors, setSeniors) }
                    />
                </div>
            </div>
            <div className={ `seniors${ !seniors.length || seniors.filter(employee => employee.display).length === 1 ? " center" : "" }` }>
                { !seniors.length ? <LoadingComponent/> :
                    seniors.filter(employee => employee.display)
                        .map(senior => <EmployeeComponent employee={ senior } key={ senior.link + senior.initials }/>)
                }
            </div>

            <div className="search">
                <div className="normal">Педагогический состав</div>
                <div className="input-field">
                    <input
                        id="teachers"
                        type="text"
                        placeholder="Поиск"
                        onChange={ (e) => search(e, teachers, setTeachers) }
                    />
                </div>
            </div>
            <div className={ `teachers${ !teachers.length || teachers.filter(employee => employee.display).length === 1 ? " center" : "" }` }>
                { !teachers.length ? <LoadingComponent/> :
                    teachers.filter(employee => employee.display)
                        .map(teacher => <EmployeeComponent employee={ teacher } key={ teacher.link + teacher.initials }/>)
                }
            </div>
        </>
    );
}
