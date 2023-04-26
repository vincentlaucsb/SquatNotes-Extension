import React from 'react';
import { formatTime } from './util';

export default function Note({ onDelete, time, note }) {
    return (
        <div className="note">
            <div className="note-header">
                <span onClick={() => {
                    const currentVideo = document.getElementsByTagName("video")[0];
                    currentVideo.currentTime = time;
                }} style={{ cursor: "pointer", fontWeight: "bold" }}>{formatTime(time)}</span>

                <div className="note-controls">
                    <button onClick={onDelete}>
                        <img className="button-icon" src={chrome.runtime.getURL("trash.png")} alt="Delete" />
                    </button>
                </div>
            </div>
            <span>{note}</span>
        </div>
    );
}
