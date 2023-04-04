import React, { useEffect, useState } from 'react';
import { formatTime } from './util';

export function Form({ addNote, currentTime, startTakingNotes, stopTakingNotes }) {
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
                        <h2>Add a Note: {formatTime(currentTime)}</h2>
                        <textarea
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={textareaKeyDownHandler}
                            autoFocus={true}
                            value={value} style={{ width: "100%" }}
                        />
                        <button onClick={onAddNote} disabled={!value}>
                            <strong>Add Note</strong> (Ctrl + Enter)
                        </button>
                        <button onClick={stopTakingNotes} style={{ marginLeft: "var(--spacing-2)" }}>
                            <strong>Cancel</strong> (Esc)
                        </button>
                    </>
                    :
                    <button onClick={() => startTakingNotes()}>Add Note</button>
            }
        </div>
    );
}