// @ts-nocheck
// TODO: Remove above

import React, { Component } from 'react';

import Note from './Note';
import Form from './Form';
import NotebookPicker from './NotebookPicker';
import ThemeCSS, { Theme } from './Theme';

import "./Content.scss";

export default class Sidebar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentTime: NaN,
            frontendPort: -1,
            finishedVideoId: null,
            isSavingNote: false,
            isVisible: false,
            messages: [],
            notebooks: [],
            notes: [],
            selectedNotebook: null,
            theme: "light"
        };

        this.addNote = this.addNote.bind(this);
    }

    get currentVideo() {
        const ret = document.getElementsByTagName("video")[0];
        return ret?.getAttribute("src") ? ret : null;
    }

    get noteStorageKey() {
        return `notes-${window.location.href}`;
    }

    componentDidMount() {
        document.body.addEventListener("keydown", (e) => {
            let isSquatNotesCmd = false;

            if (e.ctrlKey && e.key === 's') {
                this.setState({
                    isVisible: !this.state.isVisible
                });

                isSquatNotesCmd = true;
            }

            if (this.state.isVisible) {
                if (e.ctrlKey && e.key === ' ') {
                    this.setState({
                        currentTime: this.currentVideo.currentTime
                    });

                    isSquatNotesCmd = true;
                }
                else if (e.key === 'Escape') {
                    this.setState({
                        currentTime: null
                    });

                    isSquatNotesCmd = true;
                }
            }

            // Prevents SquatNotes hotkeys from triggering
            // native browser actions
            if (isSquatNotesCmd) {
                e.preventDefault();
            }
        });

        // Load Theme
        chrome.storage.local.get("theme").then((result) => {
            this.setState({ theme: result["theme"] || "light" });
        });

        // Load Notes
        chrome.storage.local.get(this.noteStorageKey).then((result) => {
            this.setState({ notes: result[this.noteStorageKey]?.notes || [] });
        });

        this.loadNotebooks();
    }

    addNote(note: string) {
        const notes = [
            // prevent notes with duplicate timestamps
            ...this.state.notes.filter(_ => _.time !== this.state.currentTime),

            // add current note
            { note, time: this.state.currentTime }
        ];

        notes.sort((a, b) => {
            if (a.time > b.time) return 1;
            else return a.time === b.time ? 0 : -1;
        });

        this.setState({ currentTime: NaN, notes }, this.persistNotes);
    }

    editNote(time: number, note: string) {
        const notes = [...this.state.notes];
        const noteToUpdate = notes.find((note) => note.time === time);
        noteToUpdate.note = note;

        this.setState({ notes }, this.persistNotes);
    }

    deleteNote(time: number) {
        this.setState({
            notes: this.state.notes.filter(_ => _.time != time)
        }, this.persistNotes);
    }

    async deleteNotes() {
        return chrome.storage.local.remove(this.noteStorageKey);
    }

    loadNotebooks() {
        chrome.runtime.sendMessage({
            contentScriptQuery: "getNotebooks"
        }).then((notebooks) => {
            this.setState({ notebooks });
        }).catch(() => {
            this.setState({ notebooks: null });
        });

        chrome.runtime.sendMessage({
            contentScriptQuery: "getFrontendPort"
        }).then((port) => {
            this.setState({ frontendPort: port });
        }).catch(() => {

        });
    }

    persistNotes() {
        let title = document.title;

        // Remove notification count from title
        if (window.location.href.includes("youtube.com")) {
            let newTitle = title.split(' ');
            newTitle.shift();
            title = newTitle.join(' ');
        }

        let items = {};
        items[this.noteStorageKey] = {
            url: window.location.href,
            notes: this.state.notes,
            title
        };

        chrome.storage.local.set(items);
    }

    saveNotes() {
        this.setState({ isSavingNote: true });

        const notes = this.state.notes.map(({ time, note }) => {
            return { time, note };
        });

        return chrome.runtime.sendMessage({
            contentScriptQuery: "saveNotes",
            notes: JSON.stringify({ notes: notes }),
            notebook: this.state.selectedNotebook,
            videoURL: window.location.href
        });
    }

    render() {
        return (
            <>
                <ThemeCSS theme={this.state.theme} />
                <div id="squatnotes" className={this.state.isVisible ? "flex" : "none"}>
                    <div className="flex" style={{
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}>
                        <h1>Notes</h1>
                        <div>
                            <button id="theme-toggler" onClick={() => {
                                const newTheme = this.state.theme === Theme.Dark ? Theme.Light : Theme.Dark;
                                this.setState({ theme: newTheme });
                                chrome.storage.local.set({
                                    theme: newTheme
                                });
                            }} title="Click to change theme">
                                {this.state.theme === Theme.Dark ?
                                    <img src={chrome.runtime.getURL("moon.png")} alt="Dark Theme" /> :
                                    <img src={chrome.runtime.getURL("sun-high.png")} alt="Light Theme" />
                                }
                            </button>
                        </div>
                    </div>
                    {this.renderPanelContents()}
                </div>
            </>
        );
    }

    renderPanelContents() {
        if (!this.currentVideo) {
            return <p>There are no videos detected on this page.</p>
        }

        if (this.state.finishedVideoId) {
            return <a href={`http://localhost:${this.state.frontendPort}#/${this.state.selectedNotebook}/notes/${this.state.finishedVideoId}`}>Note saved</a>
        }

        if (this.state.isSavingNote) {
            return (
                <>
                    <p>Saving...</p>

                    <h2 className="mt-2">Progress</h2>
                    <pre style={{ overflow: "auto" }}>
                        {this.state.messages.map((msg) => {
                            return (
                                <>{msg.message}<br /></>
                            );
                        })}
                    </pre>
                </>
            );
        }

        return (
            <>
                <div className="pr-2" style={{ overflowY: "auto" }}>
                    {this.state.notes?.length > 0 ? this.state.notes.map(({ note, time }) => {
                        return (
                            <Note
                                key={time}
                                onEdit={(note) => this.editNote(time, note)}
                                onDelete={() => this.deleteNote(time)}
                                time={time}
                                note={note}
                            />
                        );
                    }) : <p>There are no notes on this video. Once you start taking notes, they will be
                        displayed here.</p>}
                </div>
                <Form addNote={this.addNote}
                    currentTime={this.state.currentTime}
                    startTakingNotes={() => {
                        this.setState({
                            currentTime: document.getElementsByTagName("video")[0].currentTime
                        });
                    }}
                    stopTakingNotes={() => {
                        this.setState({ currentTime: null });
                    }}
                />
                <div id="save-note" className="mt-4">
                    <h2>Save Note</h2>
                    {this.state.notebooks?.length > 0 ? (
                        <div className="flex">
                            <NotebookPicker
                                disabled={!this.state.selectedNotebook}
                                notebooks={this.state.notebooks}
                                onSelectNotebook={(value) => this.setState({
                                    selectedNotebook: value
                                })}
                                saveNote={() => {
                                    this.saveNotes().then((response) => {
                                        return response.links.find(link => link.rel === "self");
                                    }).then((progressLink) => {
                                        this.updateProgress(progressLink);
                                    });
                                }}
                                selectedNotebook={this.state.selectedNotebook}
                            />
                        </div>) : (
                        <p>
                            It appears SquatNotes is not running. In order to save your notes, launch SquatNotes and hit the <strong>Reload</strong> button below.
                            <button className="btn btn-primary mt-2" onClick={() => this.loadNotebooks()}>
                                <img className="button-icon" src={chrome.runtime.getURL("reload.png")} alt="Reload" /> Reload
                            </button>
                        </p>
                    )}
                    <div>
                        <button className="btn btn-secondary mt-3" onClick={() => {
                            if (confirm("Are you sure you want to delete your notes for this video?")) {
                                this.deleteNotes().then(() => {
                                    this.setState({ notes: [] });
                                });
                            }
                        }}>
                            <img className="button-icon" src={chrome.runtime.getURL("trash.png")} alt="Delete" /> Delete Note
                        </button>
                    </div>
                </div>
            </>
        );
    }

    updateProgress(progressLink) {
        chrome.runtime.sendMessage({
            contentScriptQuery: "getProgress",
            url: progressLink.href
        }).then((data) => {
            this.setState({ messages: [...this.state.messages, ...data.messages] })

            if (!data.finished) {
                setTimeout(() => {
                    this.updateProgress(progressLink);
                }, 500);
            }
            else {
                this.deleteNotes().then(() => {
                    this.setState({
                        finishedVideoId: data.videoId,
                        notes: []
                    });
                });
            }
        });
    }
}