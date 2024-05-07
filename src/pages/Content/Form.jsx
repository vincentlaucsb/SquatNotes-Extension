import React, { useEffect, useRef, useState } from 'react';
import { formatTime, SNAPSHOT_WIDTH } from './util';

export default function Form({ addNote, currentTime, startTakingNotes, stopTakingNotes }) {
    const [value, setValue] = useState("");
    const canvasRef = useRef();
    const videoSnapshot = useRef();
    const video = document.getElementsByTagName("video")[0];

    useEffect(() => {
        if (!(currentTime > 0)) {
            setValue("");
        }
        else {
            const aspectRatio = video.videoWidth / video.videoHeight;
            const snapshotHeight = SNAPSHOT_WIDTH / aspectRatio;

            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, SNAPSHOT_WIDTH, snapshotHeight);

            const frameData = context.getImageData(0, 0, SNAPSHOT_WIDTH, snapshotHeight).data;
            videoSnapshot.current = frameData;

            context.clearRect(0, 0, canvas.width, canvas.height);
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
            <canvas id="squatnotes-canvas" ref={canvasRef} style={{
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