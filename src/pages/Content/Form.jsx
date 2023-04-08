import React, { useEffect, useState } from 'react';
import { formatTime } from './util';

export default function Form({ addNote, currentTime, startTakingNotes, stopTakingNotes }) {
    let [value, setValue] = useState("");

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
        <div id="add-note">
            {
                currentTime > 0 ?
                    <>
                        <h2>Add a Note: <span id="current-time">{formatTime(currentTime)}</span></h2>
                        <textarea
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={textareaKeyDownHandler}
                            autoFocus={true}
                            value={value} style={{ width: "100%" }}
                        />
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button onClick={stopTakingNotes}>
                                <strong>Cancel</strong>&nbsp;(Esc)
                            </button>
                            <button onClick={onAddNote} disabled={!value} style={{ marginLeft: "var(--spacing-2)" }}>
                                <strong>Add Note</strong>&nbsp;(Ctrl + Enter)
                            </button>
                        </div>
                    </>
                    :
                    <button onClick={() => startTakingNotes()}>
                        <img class="button-icon" src={chrome.runtime.getURL("notes.png")}
                            alt="Add Note" />
                        Add Note
                    </button>
            }
        </div>
    );
}