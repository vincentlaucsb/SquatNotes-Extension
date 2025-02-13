import React, { useEffect, useMemo, useState } from 'react';

import Note from './Note';
import Form from './Form';
import NotebookPicker from './NotebookPicker';
import useThemeStyle, { ThemeToggler } from '../Theme';

import "./Content.scss";
import { AppCommands, MESSAGE_TYPE } from './communication';
import { NotebookStore, useNotebooks } from './dataStores';
import getVideo from '../getVideo';
import { ThemeStore } from '../dataStores';

const noteStorageKey = `notes-${window.location.href}`;

declare global {
    interface Window {
        initiateWPFMode: () => void;

        /** Toggle the sidebar */
        toggleSquatNotesVisibility: () => void;
    }
}

async function deleteNotes() {
    return chrome.storage.local.remove(noteStorageKey);
}

function DesktopIntegration({
    onSelectNotebook,
    saveNote,
    selectedNotebook
}: {
    onSelectNotebook: (notebook: string) => void,
    saveNote: any,
    selectedNotebook: string
}) {
    const clickHere = (
        <a href="https://www.squatnotes.com/">by clicking here</a>
    );

    const notebooks = useNotebooks();

    return notebooks?.length > 0 ? (
        <div className="flex">
            <NotebookPicker
                disabled={!selectedNotebook}
                notebooks={notebooks}
                onSelectNotebook={onSelectNotebook}
                saveNote={saveNote}
                selectedNotebook={selectedNotebook}
            />
        </div>) : (
        <div>
            <p>
                It appears SquatNotes is not running. In order to save your notes, launch SquatNotes and hit the <strong>Reload</strong> button below.
            </p>
            <br />
            <p>
                If you do not have SquatNotes installed, you can download the demo version {clickHere}.
            </p>
            <button className="btn btn-primary mt-2" onClick={() => NotebookStore.load()}>
                <img
                    className="button-icon"
                    src={chrome.runtime.getURL("reload.png")}
                    alt="Reload"
                />
                Reload
            </button>
        </div>
    );
}

function ThemeCSS() {
    useThemeStyle();
    return (<></>);
}

export default function Sidebar() {
    const [currentTime, setCurrentTime] = useState(NaN);
    const [frontendPort, setFrontendPort] = useState(-1);
    const [finishedVideoId, setFinishedVideoId] = useState<number | null>(null);
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [notes, setNotes] = useState([]);
    const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);

    const currentVideo = getVideo();

    const toggleVisibility = () => setIsVisible(value => !value);

    useEffect(() => {
        window.toggleSquatNotesVisibility = toggleVisibility;

        window.addEventListener('message', function (event) {
            if (event.data.type !== MESSAGE_TYPE)
                return;

            switch (event.data.command as AppCommands) {
                case 'setTheme':
                    ThemeStore.setTheme(event.data.data);
                    break;

                case 'toggle':
                    this.window.toggleSquatNotesVisibility();
                    break;
            }
        }, false);

        document.body.addEventListener("keydown", (e) => {
            let isSquatNotesCmd = false;

            if (e.ctrlKey && e.key === 's') {
                toggleVisibility();

                isSquatNotesCmd = true;
            }

            if (isVisible) {
                if (e.ctrlKey && e.key === ' ') {
                    setCurrentTime(currentVideo.currentTime);
                    isSquatNotesCmd = true;
                }
                else if (e.key === 'Escape') {
                    setCurrentTime(NaN);
                    isSquatNotesCmd = true;
                }
            }

            // Prevents SquatNotes hotkeys from triggering
            // native browser actions
            if (isSquatNotesCmd) {
                e.preventDefault();
            }
        });

        // Load Notes
        chrome.storage.local.get(noteStorageKey).then((result) => {
            setNotes(result[noteStorageKey]?.notes);
        });

        loadNotebooks();
    }, []);

    const addNote = (note: string, snapshot: string) => {
        console.log("Notes", notes);

        const nextNotes = [
            // prevent notes with duplicate timestamps
            ...notes.filter(_ => _.time !== currentTime),

            // add current note
            { note, snapshot, time: currentTime }
        ];

        nextNotes.sort((a, b) => {
            if (a.time > b.time) return 1;
            else return a.time === b.time ? 0 : -1;
        });

        setCurrentTime(NaN);
        setNotes(nextNotes);
        persistNotes(nextNotes);
    }

    const editNote = (time: number, note: string) => {
        const nextNotes = [...notes];
        const noteToUpdate = nextNotes.find((note) => note.time === time);
        noteToUpdate.note = note;

        setNotes(nextNotes);
        persistNotes(nextNotes);
    }

    const deleteNote = (time: number) => {
        const nextNotes = notes.filter(_ => _.time != time);
        setNotes(nextNotes);
        persistNotes(nextNotes);
    }

    const loadNotebooks = () => {
        chrome.runtime.sendMessage({
            contentScriptQuery: "getFrontendPort"
        }).then((port) => {
            setFrontendPort(port);
        }).catch(() => {

        });
    }

    const persistNotes = (notes: any[]) => {
        let title = document.title;

        // Remove notification count from title
        if (window.location.href.includes("youtube.com")) {
            let newTitle = title.split(' ');
            newTitle.shift();
            title = newTitle.join(' ');
        }

        let items = {};
        items[noteStorageKey] = {
            url: window.location.href,
            notes,
            title
        };

        chrome.storage.local.set(items);
    }

    const saveNotes = () => {
        setIsSavingNote(true);

        const nextNotes = notes.map(({ time, note }) => {
            return { time, note };
        });

        return chrome.runtime.sendMessage({
            contentScriptQuery: "saveNotes",
            notes: JSON.stringify({ notes: nextNotes }),
            notebook: selectedNotebook,
            videoURL: window.location.href
        });
    }

    // TODO: Get rid of any
    const updateProgress = (progressLink: any) => {
        chrome.runtime.sendMessage({
            contentScriptQuery: "getProgress",
            url: progressLink.href
        }).then((data) => {
            setMessages(messages => [...messages, ...data.messages]);

            if (!data.finished) {
                setTimeout(() => {
                    updateProgress(progressLink);
                }, 500);
            }
            else {
                deleteNotes().then(() => {
                    setFinishedVideoId(data.videoId);
                    setNotes([]);
                });
            }
        });
    }

    return (
        <>
            <ThemeCSS />
            <div id="squatnotes" className={isVisible ? "flex" : "none"}>
                <div className="flex" style={{
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <h1>Notes</h1>
                    <div>
                        <ThemeToggler />
                    </div>
                </div>
                <SidebarContents
                    {... {
                        addNote,
                        currentTime,
                        currentVideo,
                        editNote,
                        deleteNote,
                        finishedVideoId,
                        frontendPort,
                        messages,
                        notes,
                        isSavingNote,
                        saveNotes,
                        setNotes,
                        selectedNotebook,
                        setCurrentTime,
                        setSelectedNotebook,
                        updateProgress
                    }}
                />
            </div>
        </>
    );
}

interface SidebarContentProps {
    addNote: (note: string, snapshot: string) => void;
    editNote: (time: number, note: string) => void;
    deleteNote: (time: number) => void;
    saveNotes: () => Promise<any>;
    setCurrentTime: (time: number) => void;
    setNotes: (value: any[]) => void;
    setSelectedNotebook: (selectedNotebook: string) => void;
    updateProgress: (link: any) => void;

    currentTime: number;
    frontendPort: number;
    messages: any[];
    notes: any[];
    isSavingNote: boolean;
    selectedNotebook: string;

    finishedVideoId?: number;
}

function SidebarContents({
    addNote,
    currentTime,
    editNote,
    deleteNote,
    finishedVideoId,
    frontendPort,
    messages,
    notes,
    isSavingNote,
    saveNotes,
    setNotes,
    selectedNotebook,
    setCurrentTime,
    setSelectedNotebook,
    updateProgress
}: SidebarContentProps) {
    const currentVideo = useMemo(() => getVideo(), []);

    if (!currentVideo) {
        return <p>There are no videos detected on this page.</p>
    }

    if (finishedVideoId) {
        return <a href={`http://localhost:${frontendPort}#/${selectedNotebook}/notes/${finishedVideoId}`}>Note saved</a>
    }

    if (isSavingNote) {
        return (
            <>
                <p>Saving...</p>

                <h2 className="mt-2">Progress</h2>
                <pre style={{ overflow: "auto" }}>
                    {messages.map((msg) => {
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
                {notes?.length > 0 ? notes.map(({ note, snapshot, time }) => {
                    return (
                        <Note
                            key={time}
                            onEdit={(note) => editNote(time, note)}
                            onDelete={() => deleteNote(time)}
                            time={time}
                            snapshot={snapshot}
                            note={note}
                        />
                    );
                }) : <p>There are no notes on this video. Once you start taking notes, they will be
                    displayed here.</p>}
            </div>
            <Form addNote={addNote} currentTime={currentTime}
                startTakingNotes={() => {
                    setCurrentTime(document.getElementsByTagName("video")[0].currentTime);
                }}
                stopTakingNotes={() => {
                    setCurrentTime(NaN);
                }}
            />
            <div id="save-note" className="mt-4">
                <h2>Save Note</h2>
                <DesktopIntegration
                    onSelectNotebook={(value) => setSelectedNotebook(value)}
                    saveNote={() => {
                        saveNotes().then((response) => {
                            return response.links.find(link => link.rel === "self");
                        }).then((progressLink) => {
                            updateProgress(progressLink);
                        });
                    }}
                    selectedNotebook={selectedNotebook}
                />
                <div>
                    <button className="btn btn-secondary mt-3" onClick={() => {
                        if (confirm("Are you sure you want to delete your notes for this video?")) {
                            deleteNotes().then(() => setNotes([]))
                        }
                    }}>
                        <img className="button-icon" src={chrome.runtime.getURL("trash.png")} alt="Delete" /> Delete Note
                    </button>
                </div>
            </div>
        </>
    );
}