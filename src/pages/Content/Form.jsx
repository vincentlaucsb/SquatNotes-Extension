import React, { Component, useState } from 'react';

export function Form({ addNote }) {
    let [value, setValue] = useState("");

    const onAddNote = () => {
        addNote(value);
        setValue("");
    };

    return (
        <div>
            <textarea onChange={(e) => setValue(e.target.value)} value={value} style={{ width: "100%" }}></textarea>
            <button onClick={onAddNote}>Add Note</button>
        </div>
    );
}