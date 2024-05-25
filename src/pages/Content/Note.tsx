import { marked } from "marked";
import React, { useEffect, useState } from 'react';

import { formatTime, SNAPSHOT_WIDTH } from './util';

enum NoteMode {
    Viewing = 0,
    Editing = 1,
    Deleting = 2
}

type NoteProps = {
    onEdit: (note: string) => void,

    onDelete: () => void,

    note: string,

    /** data-url for snapshot */
    snapshot: string,

    time: number
}

export default function Note({ onDelete, onEdit, note, snapshot, time }: NoteProps) {
    const [noteMode, setNoteMode] = useState(NoteMode.Viewing);
    const [tempNoteValue, setTempNoteValue] = useState(note);

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

    const setVideoTime = () => {
        const currentVideo = document.getElementsByTagName("video")[0];
        currentVideo.currentTime = time;
    };

    useEffect(() => {
        if (noteMode === NoteMode.Editing) {
            document.addEventListener('keydown', editingKeydownHandler);

            return () => {
                document.removeEventListener('keydown', editingKeydownHandler)
            };
        }
    }, [noteMode]);

    const parsedMarkdown = marked.parse(note);

    const deleteControls = (noteMode === NoteMode.Deleting) ? (
        <div className="flex">
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
        <div className="mt-1">
            <textarea
                autoFocus
                className="w-100"
                onChange={(e) => setTempNoteValue(e.target.value)}
                value={tempNoteValue}
            />
            <div className="flex" style={{ justifyContent: "flex-end" }} >
                <button className="btn hover-btn-secondary" onClick={() => {
                    setNoteMode(NoteMode.Viewing)
                    setTempNoteValue(note);
                }} title="Edit Note (Esc)">
                    Cancel
                </button>
                <button className="btn btn-secondary ml-2"
                    onClick={() => saveEdit()}
                    title="Delete Note (Ctrl + Enter)">
                    <strong>Save</strong>
                </button>
            </div>
        </div>
    ) : (
        <span dangerouslySetInnerHTML={{ __html: parsedMarkdown }} />
    );

    return (
        <div className="note flex my-3">
            <img
                className="note-snapshot"
                onClick={() => setVideoTime()}
                style={{ cursor: "pointer" }}
                src={snapshot}
                width={SNAPSHOT_WIDTH}
            />
            <div className="ml-2" style={{ flexGrow: 1 }}>
                <div className="flex" style={{ justifyContent: "space-between" }}>
                    <span onClick={() => setVideoTime()} style={{ cursor: "pointer", fontWeight: "bold" }}>{formatTime(time)}</span>

                    <div className="flex note-controls">
                        <button onClick={() => setNoteMode(NoteMode.Editing)}>
                            <img className="button-icon" src={chrome.runtime.getURL("pencil.png")} alt="Edit" />
                        </button>
                        {deleteControls}
                    </div>
                </div>
                {noteContent}
            </div>
        </div>
    );
}