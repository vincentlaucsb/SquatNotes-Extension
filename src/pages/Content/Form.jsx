import React, { Component, useState } from 'react';
import { formatTime } from './util';

export function Form({ addNote, currentTime, startTakingNotes }) {
    let [value, setValue] = useState("");

    const onAddNote = () => {
        addNote(value);
        setValue("");
    };

    return (
        currentTime > 0 ?
            <div>
                <h2>Add a Note: {formatTime(currentTime)}</h2>
                <textarea onChange={(e) => setValue(e.target.value)} value={value} style={{ width: "100%" }}></textarea>
                <button onClick={onAddNote}>Add Note</button>
            </div>
            :
            <div>
                <button onClick={() => startTakingNotes()}>Add Note</button>
            </div>
    );
}