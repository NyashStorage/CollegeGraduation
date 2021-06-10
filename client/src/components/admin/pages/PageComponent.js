import React, { useState, useContext, useEffect } from "react";
import { Helmet } from "react-helmet";

import { APIContext } from "../../../contexts/APIContext";
import { AuthContext } from "../../../contexts/AuthContext";

import { EditorState, ContentState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import toDraft from "html-to-draftjs";
import toHtml from "draftjs-to-html";

export const PageComponent = ({ history, match, type }) => {
    const [element, setElement] = useState(undefined);
    const [code, setCode] = useState("");

    const { request } = useContext(APIContext);
    const { password } = useContext(AuthContext);

    async function submit(e) {
        e.preventDefault();

        const form = Array.from(new FormData(e.target).entries());
        const data = { };
        form.forEach((item) => { data[item[0]] = item[1] });
        data["password"] = password;
        data["html"] = toHtml(convertToRaw(code.getCurrentContent()));

        if(type === "update") {
            data["id"] = element.id;
            if(!data.link) data.link = "Главная страница";
        }

        const ans = await request(`api/pages/${ type }`, "POST", data);
        if(!ans) return;

        history.push(`/admin/pages`);
    }

    useEffect(() => {
        (async () => {
            if(type !== "update") return;

            const elem = await request(`api/pages/get?id=${ match.params.id }`);
            if(elem.length === 0) return history.push(`/admin/pages`);
            setElement(elem[0]);

            setCode(EditorState.createWithContent(
                ContentState.createFromBlockArray(
                    toDraft(decodeURIComponent(elem[0]?.html) || "").contentBlocks
                )
            ));
        })();
    }, [type, request, match.params.id, history]);

    return (
        <>
            <Helmet title={ `${ type === "update" ? "Изменить" : "Добавить" } элемент < Политехнический колледж БГТУ` }/>
            <div className="normal">{ type === "update" ? "Изменить" : "Добавить" } элемент</div>
            <form className="clear" onSubmit={ submit }>
                <div className="input-field">
                    <input
                        name="link"
                        id="link"
                        type="text"
                        placeholder="Ссылка"
                        defaultValue={ element ? element.link : "" }
                        disabled={ element ? element.link === "Главная страница" : false }
                        required
                    />
                </div>
                <div className="input-field">
                    <input
                        name="title"
                        id="title"
                        type="text"
                        placeholder="Заголовок"
                        defaultValue={ element ? decodeURIComponent(element.title) : "" }
                        required
                    />
                </div>
                {
                    type === "update" && !element ? "" : <p>
                        <label>
                            <input
                                name="menu"
                                id="menu"
                                type="checkbox"
                                defaultChecked={ element ? element.menu : false }
                            />
                            <span>В меню</span>
                        </label>
                    </p>
                }
                <Editor
                    wrapperClassName="wrapper" editorClassName="editor"
                    localization={{ locale: "ru" }} placeholder="Содержание страницы"
                    onEditorStateChange={ setCode } editorState={ code }
                    toolbar={{
                        options: ["inline", "blockType", "textAlign", "colorPicker", "link", "image", "history"],
                        inline: { options: ["bold", "underline"] },
                        blockType: {
                            inDropdown: true,
                            options: ["H1", "H2", "H3"]
                        },
                        textAlign: { options: ["left", "center", "right"] },
                        colorPicker: {
                            colors: [
                                "rgb(255, 255, 255)", "rgb(0, 0, 0)",
                                "rgb(180, 180, 180)", "rgb(50, 50, 50)",
                                "rgb(170,0,0)", "rgb(20,140,20)", "rgb(0,0,195)",
                                "rgb(14,47,85)", "rgb(222, 62, 62)"
                            ]
                        },
                        link: {
                            showOpenOptionOnHover: true,
                            defaultTargetOption: "_blank",
                            options: ["link"]
                        },
                        image: {
                            urlEnabled: true,
                            alignmentEnabled: true,
                            previewImage: true,
                            inputAccept: "image/jpeg,image/jpg,image/png,image/svg",
                            alt: { present: false, mandatory: false },
                            defaultSize: { height: "auto", width: "auto" }
                        }
                    }}
                />
                <button type="submit">
                    <i className="material-icons left">{ type === "update" ? "edit" : "add" }</i> { type === "update" ? "Изменить" : "Создать" }
                </button>
            </form>
        </>
    );
}
