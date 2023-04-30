import { marked } from "marked";
import React from 'react';

import { formatTime } from './util';

export default function Note({ onDelete, onEdit, time, note }) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [tempNoteValue, setTempNoteValue] = React.useState(note);

    const parsedMarkdown = marked.parse(note);

    const noteContent = isEditing ? (
        <div>
            <textarea onChange={(e) => setTempNoteValue(e.target.value)} value={tempNoteValue} />
            <button onClick={() => {
                setIsEditing(false);
                onEdit(tempNoteValue);
                setTempNoteValue(tempNoteValue);
            }}>Save</button>
            <button onClick={() => {
                setIsEditing(false);
                setTempNoteValue(note);
            }}>Cancel</button>
        </div>
    ) : (
        <span dangerouslySetInnerHTML={{ __html: parsedMarkdown }} />
    );

    return (
        <div className="note">
            <div className="note-header">
                <span onClick={() => {
                    const currentVideo = document.getElementsByTagName("video")[0];
                    currentVideo.currentTime = time;
                }} style={{ cursor: "pointer", fontWeight: "bold" }}>{formatTime(time)}</span>

                <div className="flex note-controls">
                    <button onClick={() => setIsEditing(true)}>
                        [Edit]
                    </button>
                    <button onClick={onDelete}>
                        <img className="button-icon" src={chrome.runtime.getURL("trash.png")} alt="Delete" />
                    </button>
                </div>
            </div>
            {noteContent}
        </div>
    );
}
