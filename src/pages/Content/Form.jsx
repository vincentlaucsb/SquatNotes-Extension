import React, { useState } from 'react';
import { formatTime } from './util';

export function Form({ addNote, currentTime, startTakingNotes, stopTakingNotes }) {
    let [value, setValue] = useState("");

    const onAddNote = () => {
        if (value) {
            addNote(value);
            setValue("");
        }
    };

    return (
        <div id="add-note">
            {
                currentTime > 0 ?
                    <>
                        <h2>Add a Note: {formatTime(currentTime)}</h2>
                        <textarea onChange={(e) => setValue(e.target.value)} value={value} style={{ width: "100%" }}></textarea>
                        <button onClick={onAddNote} disabled={!value}>Add Note</button>
                        <button
                            onClick={stopTakingNotes}
                            style={{ marginLeft: "var(--spacing-2)" }}
                        >Cancel</button>
                    </>
                    :
                    <button onClick={() => startTakingNotes()}>Add Note</button>
            }
        </div>
    );
}