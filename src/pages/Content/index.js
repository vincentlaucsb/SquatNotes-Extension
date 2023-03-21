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
            currentTime: NaN,
            notebooks: null,
            notes: [],
            selectedNotebook: null
        };
    }

    componentDidMount() {
        chrome.runtime.sendMessage({
            contentScriptQuery: "getNotebooks"
        }).then((notebooks) => {
            this.setState({ notebooks });
        });
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

        console.log("Saving Notes", this.state);

        return chrome.runtime.sendMessage({
            contentScriptQuery: "saveNotes",
            notes: JSON.stringify({ notes: notes }),
            notebook: this.state.selectedNotebook,
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
                    const notes = [...this.state.notes, { note, time: this.state.currentTime }];
                    notes.sort((a, b) => {
                        if (a.time > b.time) {
                            return 1;
                        }
                        else {
                            return a.time === b.time ? 0 : -1;
                        }
                    });

                    this.setState({
                        currentTime: NaN,
                        notes
                    });
                }}
                    currentTime={this.state.currentTime}
                    startTakingNotes={() => {
                        this.setState({
                            currentTime: document.getElementsByTagName("video")[0].currentTime
                        });
                    }}
                />
                <div style={{ marginTop: "2rem" }}>
                    <select name="notebook" value={this.state.selectedNotebook} onChange={(e) => {
                        this.setState({
                            selectedNotebook: e.currentTarget.value
                        });
                    }}>
                        <option value="">Select a notebook</option>
                        {Array.isArray(this.state.notebooks) ? this.state.notebooks.map(({ id, name }) => {
                            return (<option value={id}>{name}</option>);
                        }) : null}
                    </select>
                    <button onClick={() => this.saveNotes()}>Save</button>
                </div>
            </div>
        );
    }
}

const STATE = {
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

function getContainerStyles(isVisible) {
    return [isVisible ? "display: block" : "display: none", ...CONTAINER_STYLES].join("; ");
}

(function () {
    'use strict';

    const body = document.body;

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