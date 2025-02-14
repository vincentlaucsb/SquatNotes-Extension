import { useState } from "react";

// TODO: Remove all query string params except v
export function noteStorageKey() {
    return `notes-${window.location.href}`;
};

export default function useNotes(init: any[]) {
    const [currentTime, setCurrentTime] = useState(NaN);
    const [notes, setNotes] = useState(init);

    const persistNotes = (notes: any[]) => {
        let title = document.title;

        // Remove notification count from title
        if (window.location.href.includes("youtube.com")) {
            let newTitle = title.split(' ');
            newTitle.shift();
            title = newTitle.join(' ');
        }

        let items = {};
        items[noteStorageKey()] = {
            url: window.location.href,
            notes,
            title
        };

        chrome.storage.local.set(items);
    }

    return {
        currentTime,
        notes,

        addNote: (note: string, snapshot: string) => {
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
        },

        deleteNote: (time: number) => {
            const nextNotes = notes.filter(_ => _.time != time);
            setNotes(nextNotes);
            persistNotes(nextNotes);
        },

        editNote: (time: number, note: string) => {
            const nextNotes = [...notes];
            const noteToUpdate = nextNotes.find((note) => note.time === time);
            noteToUpdate.note = note;

            setNotes(nextNotes);
            persistNotes(nextNotes);
        },

        setCurrentTime,
        setNotes
    }
}