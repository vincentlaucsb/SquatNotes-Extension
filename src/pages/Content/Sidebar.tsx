import React, { Component } from 'react';

import Note from './Note';
import Form from './Form';
import NotebookPicker from './NotebookPicker';

export default class Sidebar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentTime: NaN,
            finishedVideoId: null,
            isSavingNote: false,
            isVisible: false,
            messages: [],
            notebooks: [],
            notes: [],
            selectedNotebook: null
        };
    }

    get currentVideo() {
        let ret = document.getElementsByTagName("video")[0];

        if (ret?.getAttribute("src"))
            return ret;

        return null;
    }

    componentDidMount() {
        document.body.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.key === 's') {
                this.setState({
                    isVisible: !this.state.isVisible
                });

                e.preventDefault();
            }

            if (this.state.isVisible) {
                if (e.ctrlKey && e.key === ' ') {
                    this.setState({
                        currentTime: this.currentVideo.currentTime
                    });
                }
                else if (e.key === 'Escape') {
                    this.setState({
                        currentTime: null
                    });
                }
            }
        });

        this.loadNotebooks();
    }

    deleteNote(time) {
        this.setState({
            notes: this.state.notes.filter(_ => _.time != time)
        });
    }

    loadNotebooks() {
        chrome.runtime.sendMessage({
            contentScriptQuery: "getNotebooks"
        }).then((notebooks) => {
            this.setState({ notebooks });
        });
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
            <div id="squatnotes" style={{
                display: this.state.isVisible ? "flex" : "none"
            }}>
                <h1>Notes</h1>
                {this.renderPanelContents()}
            </div>
        );
    }

    renderPanelContents() {
        if (!this.currentVideo) {
            return <p>There are no videos detected on this page.</p>
        }

        if (this.state.finishedVideoId) {
            return <a href={`http://localhost:${this.props.frontendPort}#/${this.state.selectedNotebook}/notes/${this.state.finishedVideoId}`}>Note saved</a>
        }

        if (this.state.isSavingNote) {
            return (
                <>
                    <p>Saving...</p>

                    <h2 style={{ marginTop: "var(--spacing-2)" }}>Progress</h2>
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
                <div style={{ overflowY: "auto", paddingRight: "var(--spacing-2)" }}>
                    {this.state.notes?.length > 0 ? this.state.notes.map(({ note, time }) => {
                        return (
                            <Note onDelete={() => this.deleteNote(time)} time={time} note={note} />
                        );
                    }) : <p>There are no notes on this video. Once you start taking notes, they will be
                        displayed here.</p>}
                </div>
                <Form addNote={(note) => {
                    const notes = [
                        // prevent notes with duplicate timestamps
                        ...this.state.notes.filter(_ => _.time !== this.state.currentTime),

                        // add current note
                        { note, time: this.state.currentTime }
                    ];
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
                    stopTakingNotes={() => {
                        this.setState({ currentTime: null });
                    }}
                />
                <div id="save-note">
                    <h2>Save Note</h2>
                    {this.state.notebooks != null ? (
                        <div id="notebook-picker">
                            <NotebookPicker
                                disabled={(this.state.notes.length === 0) || !this.state.selectedNotebook}
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
                            It appears SquatNotes is not running. Please launch SquatNotes and reload this page.
                            <button onClick={() => this.loadNotebooks()}>Reload</button>
                        </p>
                    )}
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
                this.setState({ finishedVideoId: data.videoId });
            }
        });
    }
}