import React, { useEffect, useRef, useState } from 'react';
import { formatTime, SNAPSHOT_WIDTH } from './util';
import { getSnapshotData, getSnapshotHeight } from './snapshots';

type FormProps = {
    addNote: (note: string, snapshot: string) => void,
    currentTime: number,
    startTakingNotes: () => void,
    stopTakingNotes: () => void
};

export default function Form({ addNote, currentTime, startTakingNotes, stopTakingNotes }: FormProps) {
    const [value, setValue] = useState("");
    const canvasRef = useRef<HTMLCanvasElement>();
    const videoSnapshot = useRef<string>();

    // TODO: Make method of finding video more robust
    const video = document.getElementsByTagName("video")[0];
    const snapshotHeight = getSnapshotHeight(video);

    useEffect(() => {
        if (!(currentTime > 0)) {
            setValue("");
        }
        else {
            videoSnapshot.current = getSnapshotData(video, canvasRef.current);
        }
    }, [currentTime]);

    const onAddNote = () => {
        if (value) {
            addNote(value, videoSnapshot.current);
            setValue("");
        }
    };

    const textareaKeyDownHandler = (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            onAddNote();
        }
    };

    return (
        <div id="add-note" className="mt-2">
            <canvas id="squatnotes-canvas" width={SNAPSHOT_WIDTH} height={snapshotHeight} ref={canvasRef} style={{
                display: "none"
            }}></canvas>
            {
                currentTime > 0 ?
                    <>
                        <h2>Add a Note: <span id="current-time">{formatTime(currentTime)}</span></h2>
                        <textarea
                            autoFocus={true}
                            className="rounded-1"
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={textareaKeyDownHandler}
                            value={value} style={{ width: "100%" }}
                        />
                        <div className="flex" style={{ justifyContent: "flex-end" }}>
                            <button className="btn hover-btn-primary" onClick={stopTakingNotes}>
                                <strong>Cancel</strong>&nbsp;(Esc)
                            </button>
                            <button className="btn btn-primary ml-2" onClick={onAddNote} disabled={!value}>
                                <strong>Add Note</strong>&nbsp;(Ctrl + Enter)
                            </button>
                        </div>
                    </>
                    :
                    <button className="btn btn-primary mt-2" onClick={() => startTakingNotes()}>
                        <img className="button-icon" src={chrome.runtime.getURL("notes.png")}
                            alt="Add Note" />
                        <strong>Add Note</strong>&nbsp;(Ctrl + Space)
                    </button>
            }
        </div>
    );
}