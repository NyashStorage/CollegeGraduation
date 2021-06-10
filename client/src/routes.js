import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import { CommonPage } from "./pages/CommonPage";
import { EmployeesComponent } from "./components/staff/EmployeesComponent";

import { AuthComponent } from "./components/admin/auth/AuthComponent";
import { ChangePasswordComponent } from "./components/admin/auth/ChangePasswordComponent";
import { ChangeHistoryComponent } from "./components/admin/history/ChangeHistoryComponent";
import { ElementsComponent } from "./components/admin/elements/ElementsComponent";
import { PageComponent } from "./components/admin/pages/PageComponent";
import { ElementComponent } from "./components/admin/elements/ElementComponent";

export const useRoutes = (password) => {
    if(password === undefined) return;

    if(!password)
        return (
            <Switch>
                <Route path="/staff" component={ EmployeesComponent } exact/>
                <Route path="/admin" component={ AuthComponent } exact/>
                <Route path="/:page" render={ (props) => <CommonPage { ...props }/> } exact/>
                <Route path="/" render={ (props) => <CommonPage { ...props }/> } exact/>
                <Redirect to="/"/>
            </Switch>
        );

    return (
        <Switch>
            <Route path="/admin/password" component={ ChangePasswordComponent } exact/>
            <Route path="/admin/history" component={ ChangeHistoryComponent } exact/>
            <Route path="/admin/:category" render={ (props) => <ElementsComponent  { ...props }/> } exact/>
            <Route path="/admin/pages/create" render={ (props) => <PageComponent { ...props } type="create"/> } exact/>
            <Route path="/admin/pages/:id" render={ (props) => <PageComponent { ...props } type="update"/> } exact/>
            <Route path="/admin/:category/create" render={ (props) => <ElementComponent { ...props } type="create"/> } exact/>
            <Route path="/admin/:category/:id" render={ (props) => <ElementComponent { ...props } type="update"/> } exact/>
            <Route path="/staff" component={ EmployeesComponent } exact/>
            <Route path="/:page" render={ (props) => <CommonPage  { ...props }/> } exact/>
            <Route path="/" render={ (props) => <CommonPage { ...props }/> } exact/>
            <Redirect to="/"/>
        </Switch>
    );
}
