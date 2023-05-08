import React from "react";

export type NotebookPickerProps = {
    disabled: boolean;
    saveNote: () => void;
    selectedNotebook: string;
    onSelectNotebook: (value: string) => void;

    notebooks?: any[];
}

export default function NotebookPicker(props: NotebookPickerProps) {
    return (
        <>
            <select name="notebook" value={props.selectedNotebook || ""} onChange={(e) => {
                props.onSelectNotebook(e.currentTarget.value);
            }}>
                <option value="">Select a notebook</option>
                {Array.isArray(props.notebooks) ? props.notebooks.map(({ id, name }) => {
                    return (<option value={id} key={id}>{name}</option>);
                }) : null}
            </select>
            <button className="btn-primary ml-2" onClick={() => props.saveNote()} disabled={props.disabled}>
                <img className="button-icon" src={chrome.runtime.getURL("device-floppy.png")} alt="Save Note" />
                Save
            </button>
        </>
    );
}