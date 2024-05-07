// @ts-nocheck
// TODO: Remove above

import { marked } from "marked";
import React, { useEffect, useRef } from 'react';

import { formatTime, SNAPSHOT_WIDTH } from './util';

enum NoteMode {
    Viewing = 0,
    Editing = 1,
    Deleting = 2
}

type NoteProps = {
    note: string
}

export default function Note({ onDelete, onEdit, snapshot, time, note }: NoteProps) {
    const snapshotRef = useRef<HTMLCanvasElement>();
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

    useEffect(() => {
        if (noteMode === NoteMode.Editing)
            document.addEventListener('keydown', editingKeydownHandler);
        else
            document.removeEventListener('keydown', editingKeydownHandler);
    }, [noteMode]);

    useEffect(() => {
        if (snapshotRef.current) {
            const canvas = snapshotRef.current;
            const context = canvas.getContext('2d');
            const snapshotData = new ImageData(
                new Uint8ClampedArray(JSON.parse(snapshot)),
                SNAPSHOT_WIDTH
            );

            context.putImageData(snapshotData, 0, 0);
        }
    }, [snapshotRef.current]);

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
        <div class="mt-1">
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
        <div className="note flex my-2">
            <canvas className="note-snapshot" width={SNAPSHOT_WIDTH} ref={snapshotRef}></canvas>
            <div className="ml-2" style={{ flexGrow: 1 }}>
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
        </div>
    );
}
