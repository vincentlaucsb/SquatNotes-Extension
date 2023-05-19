import { marked } from "marked";
import React from 'react';

import { formatTime } from './util';

enum NoteMode {
    Viewing = 0,
    Editing = 1,
    Deleting = 2
}

type NoteProps = {
    note: string
}

export default function Note({ onDelete, onEdit, time, note }: NoteProps) {
    const [noteMode, setNoteMode] = React.useState(NoteMode.Viewing);
    const [tempNoteValue, setTempNoteValue] = React.useState(note);

    const editingKeydownHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            setNoteMode(NoteMode.Viewing);
        }
        else if (e.ctrlKey && e.key === 'Enter') {
            saveEdit();
        }
    };

    const saveEdit = () => {
        setNoteMode(NoteMode.Viewing);
        onEdit(tempNoteValue);
        setTempNoteValue(tempNoteValue);
    };

    React.useEffect(() => {
        if (noteMode === NoteMode.Editing)
            document.addEventListener('keydown', editingKeydownHandler);
        else
            document.removeEventListener('keydown', editingKeydownHandler);
    }, [noteMode]);

    const parsedMarkdown = marked.parse(note);

    const deleteControls = (noteMode === NoteMode.Deleting) ? (
        <div>
            <button onClick={onDelete}>
                <img className="button-icon" src={chrome.runtime.getURL("check.png")}
                    alt="Confirm Delete" title="Confirm Delete" />
            </button>
            <button onClick={() => setNoteMode(NoteMode.Viewing)}>
                <img className="button-icon" src={chrome.runtime.getURL("x.png")}
                    alt="Cancel Delete" title="Cancel Delete" />
            </button>
        </div>
    ) : (
        <button onClick={() => setNoteMode(NoteMode.Deleting)}>
            <img className="button-icon" src={chrome.runtime.getURL("trash.png")} alt="Delete" />
        </button>
    );

    const noteContent = noteMode === NoteMode.Editing ? (
        <div>
            <textarea
                autoFocus
                className="w-100"
                onChange={(e) => setTempNoteValue(e.target.value)}
                value={tempNoteValue}
            />
            <div className="flex" style={{ justifyContent: "flex-end" }} >
                <button className="btn-primary" onClick={() => {
                    setNoteMode(NoteMode.Viewing)
                    setTempNoteValue(note);
                }} title="Edit Note">
                    <strong>Cancel</strong>&nbsp;(Esc)
                </button>
                <button className="btn-primary ml-2" onClick={() => saveEdit()} title="Delete Note">
                    <strong>Save</strong>&nbsp;(Ctrl + Enter)
                </button>
            </div>
        </div>
    ) : (
        <span dangerouslySetInnerHTML={{ __html: parsedMarkdown }} />
    );

    return (
        <div className="note my-2">
            <div className="flex" style={{ justifyContent: "space-between" }}>
                <span onClick={() => {
                    const currentVideo = document.getElementsByTagName("video")[0];
                    currentVideo.currentTime = time;
                }} style={{ cursor: "pointer", fontWeight: "bold" }}>{formatTime(time)}</span>

                <div className="flex note-controls">
                    <button onClick={() => setNoteMode(NoteMode.Editing)}>
                        <img className="button-icon" src={chrome.runtime.getURL("pencil.png")} alt="Edit" />
                    </button>
                    {deleteControls}
                </div>
            </div>
            {noteContent}
        </div>
    );
}
