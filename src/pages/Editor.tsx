import React, {useCallback, useEffect, useState} from "react";
import MDEditor from '@uiw/react-md-editor';
import "@uiw/react-md-editor/markdown-editor.css";
import "./Editor.css";

interface EditorProps {
    title?: string | undefined;
    series?: string | undefined;
    description?: string | undefined;
    content?: string | undefined;
    slug?: string | undefined;
}

async function uploadImageToServer(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("http://127.0.0.1:8000/upload/", {
        method: "POST",
        body: formData,
    });
    const data = await response.json();
    return data.imageUrl; // 실제 API 응답에 맞게 조정
}
const Editor: React.FC<EditorProps> = ({title, series, content, description, slug}) => {
    const [value, setValue] = useState<string>(content == undefined ? "" : content);
    const [_title, setTitle] = useState<string>(title == undefined ? "" : title);
    const [_series, setSeries] = useState<string>(series == undefined ? "" : series);
    const [_description, setDescription] = useState<string>(description == undefined ? "" : description);
    const [saved, setSaved] = useState<boolean>(false);
    const [modify, setModify] = useState<boolean>(false);

    useEffect(() => {
        if (!saved)
            return
        fetch("http://127.0.0.1:8000/post/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({title: _title, series: _series, description: _description, content: value, slug: ""}),
        }).then(res => {
            if (res.ok) {
                res.json().then(data => {
                    document.location.href = `/blog/${data.slug}`;
                    alert("Saved successfully");
                });
            }
        }).catch(err => alert(err));
    }, [saved]);

    useEffect(() => {
        if(!modify)
            return
        fetch('http://127.0.0.1:8000/post/', {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({title: _title, series: _series, description: _description, content: value, slug: slug}),
        }).then(res => {
            if (res.ok) {
                res.json().then(data => {
                    document.location.href = `/blog/${data.slug}`;
                    alert("Modified successfully");
                });
            }
        });
    }, [modify]);

    // 주제별 모드 설정
    React.useEffect(() => {
        const theme = document.documentElement.getAttribute('data-theme') || 'light';
        document.documentElement.setAttribute('data-color-mode', theme);
    }, []);

    const handleValueChange = (newValue: string | undefined): void => {
        if (typeof newValue === 'string') {
            setValue(newValue);
        }
    };

    // 여기에서 저장 로직을 구현할 수 있습니다.
    const handleSave = async (event: React.FormEvent<HTMLFormElement> | React.MouseEvent) => {
        event.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
        if (slug != undefined && slug != "") {
            console.log("Modify data:", {_title, _series, _description, content: value, slug: slug});
            setModify(true)
        } else {
            console.log("Saving data:", {_title, _series, _description, content: value});
            setSaved(true)
        }
    };


    // 클립보드에서 이미지 붙여넣기 처리
    const handlePaste = useCallback((event: ClipboardEvent) => {
        const items = event.clipboardData?.items;
        if (items) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") !== -1) {
                    const file   = items[i].getAsFile();
                    // 이미지 파일을 서버에 업로드하고 URL을 받아온다
                    if (!file) {
                        continue;
                    }
                    uploadImageToServer(file).then((imageUrl) => {
                        // 에디터의 현재 값을 업데이트하고, 업로드된 이미지를 삽입한다
                        const timestamp = new Date().getTime();
                        const markdownImage = `![${timestamp}](${imageUrl})\n`;
                        setValue((prevValue) => `${prevValue}\n${markdownImage}`);
                    });
                    event.preventDefault();
                }
            }
        }
    }, []);

    useEffect(() => {
        document.addEventListener("paste", handlePaste);

        return () => {
            document.removeEventListener("paste", handlePaste);
        };
    }, [handlePaste]);

    return (
        <div className="editor-container">
            <div className="input-group">
                <input type="text" value={_title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
                <input type="text" value={_series} onChange={(e) => setSeries(e.target.value)} placeholder="Series" />
                <textarea value={_description} onChange={(e) => setDescription(e.target.value)} placeholder="Description"></textarea>
            </div>
            <MDEditor value={value} onChange={handleValueChange} height={600} />
            <button className="save-button" onClick={(e) => handleSave(e)}>Save</button>
        </div>
    );
}

export default Editor;
