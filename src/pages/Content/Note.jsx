import { marked } from "marked";
import React from 'react';

import { formatTime } from './util';

export default function Note({ onDelete, onEdit, time, note }) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const [tempNoteValue, setTempNoteValue] = React.useState(note);

    const parsedMarkdown = marked.parse(note);

    const deleteControls = isDeleting ? (
        <div>
            <button onClick={onDelete}>
                <img className="button-icon" src={chrome.runtime.getURL("check.png")}
                    alt="Confirm Delete" title="Confirm Delete" />
            </button>
            <button onClick={() => setIsDeleting(false)}>
                <img className="button-icon" src={chrome.runtime.getURL("x.png")}
                    alt="Cancel Delete" title="Cancel Delete" />
            </button>
        </div>
    ) : (
        <button onClick={() => setIsDeleting(true)}>
            <img className="button-icon" src={chrome.runtime.getURL("trash.png")} alt="Delete" />
        </button>
    );

    const noteContent = isEditing ? (
        <div>
            <textarea className="w-100" onChange={(e) => setTempNoteValue(e.target.value)} value={tempNoteValue} />
            <div className="flex">
                <button className="btn-primary" onClick={() => {
                    setIsEditing(false);
                    onEdit(tempNoteValue);
                    setTempNoteValue(tempNoteValue);
                }}>Save</button>
                <button className="btn-primary ml-2" onClick={() => {
                    setIsEditing(false);
                    setTempNoteValue(note);
                }}>Cancel</button>
            </div>
        </div>
    ) : (
        <span dangerouslySetInnerHTML={{ __html: parsedMarkdown }} />
    );

    return (
        <div className="note my-2">
            <div className="flex" style={{ justifyContent: "space-between" }} >
                <span onClick={() => {
                    const currentVideo = document.getElementsByTagName("video")[0];
                    currentVideo.currentTime = time;
                }} style={{ cursor: "pointer", fontWeight: "bold" }}>{formatTime(time)}</span>

                <div className="flex note-controls">
                    <button onClick={() => setIsEditing(true)}>
                        <img className="button-icon" src={chrome.runtime.getURL("pencil.png")} alt="Edit" />
                    </button>
                    {deleteControls}
                </div>
            </div>
            {noteContent}
        </div>
    );
}
