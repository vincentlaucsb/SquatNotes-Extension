import React, { useState } from 'react';
import { formatTime } from './util';

export default function Form({ addNote, currentTime, startTakingNotes, stopTakingNotes }) {
    let [value, setValue] = useState("");

    React.useEffect(() => {
        if (!(currentTime > 0)) setValue("");
    }, [currentTime]);

    const onAddNote = () => {
        if (value) {
            addNote(value);
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
                            <button onClick={stopTakingNotes}>
                                <strong>Cancel</strong>&nbsp;(Esc)
                            </button>
                            <button className="btn-primary ml-2" onClick={onAddNote} disabled={!value}>
                                <strong>Add Note</strong>&nbsp;(Ctrl + Enter)
                            </button>
                        </div>
                    </>
                    :
                    <button className="btn-primary mt-2" onClick={() => startTakingNotes()}>
                        <img className="button-icon" src={chrome.runtime.getURL("notes.png")}
                            alt="Add Note" />
                        <strong>Add Note</strong>&nbsp;(Ctrl + Space)
                    </button>
            }
        </div>
    );
}