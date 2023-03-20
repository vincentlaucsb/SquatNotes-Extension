import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { Note } from './Note';
import { Form } from './Form';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

class Sidebar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            notes: [
                {
                    note: "ASDF",
                    time: 10.1
                },
                {
                    note: "TEST ASDF",
                    time: 20
                }
            ]
        };
    }

    deleteNote(time) {
        this.setState({
            notes: this.state.notes.filter(_ => _.time != time)
        });
    }

    saveNotes() {
        const notes = this.state.notes.map(({ time, note }) => {
            return { time, note };
        });

        console.log("Saving Notes", window.location.href, notes);

        return chrome.runtime.sendMessage({
            contentScriptQuery: "saveNotes",
            notes: JSON.stringify({ notes: notes }),
            videoURL: window.location.href
        });
    }

    render() {
        return (
            <div>
                <h1>Notes</h1>
                {this.state.notes.map(({ note, time }) => {
                    return (
                        <Note onDelete={() => this.deleteNote(time)} time={time} note={note} />
                    );
                })}
                <Form addNote={(note) => {
                    const currentTime = document.getElementsByTagName("video")[0].currentTime;
                    const notes = [...this.state.notes, { note, time: currentTime }];
                    notes.sort((a, b) => {
                        if (a.time > b.time) {
                            return 1;
                        }
                        else {
                            return a.time === b.time ? 0 : -1;
                        }
                    });

                    this.setState({ notes });
                }} />
                <div style={{ marginTop: "2rem" }}>
                    <button onClick={() => this.saveNotes()}>Save</button>
                </div>
            </div>
        );
    }
}

const STATE = {
    isAddingNote: false,
    isVisible: false
};

const CONTAINER_STYLES = [
    "width: 400px",
    "height: 100vh",
    "position: fixed",
    "top: 0",
    "right: 0",

    "background: #ffffff",
    "z-index: 9999",
    "padding: 1rem",

    "border-left: 1px solid #000000",

    "font-size: 12pt"
];

const GLOBAL_CSS = `
    #squatnotes .note {
        margin: 1rem 0;
    }

    #squatnotes .note-header {
        display: flex;
    }

    #squatnotes .delete-button {
        margin-left: auto;
    }

    #squatnotes .save-button {
        margin-top: 1rem;
    }
`;

function getContainerStyles(isVisible) {
    return [isVisible ? "display: block" : "display: none", ...CONTAINER_STYLES].join("; ");
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const secondsTxt = seconds < 10 ? `0${seconds}` : seconds;

    return `${minutes}:${secondsTxt}`;
}

(function () {
    'use strict';

    const body = document.body;
    const head = document.head;

    let styles = document.createElement("style");
    styles.innerHTML = GLOBAL_CSS;
    head.appendChild(styles);

    let toInsert = document.createElement("div");
    toInsert.setAttribute("id", "squatnotes");
    toInsert.setAttribute("style", getContainerStyles());
    body.appendChild(toInsert);

    ReactDOM.render(<Sidebar />, toInsert);

    body.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === 's') {
            STATE.isVisible = !STATE.isVisible;
            toInsert.setAttribute("style", getContainerStyles(STATE.isVisible));
            e.preventDefault();
        }
    });
})();