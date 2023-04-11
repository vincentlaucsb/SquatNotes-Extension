import React from 'react';
import { formatTime } from './util';

export default function Note({ onDelete, time, note }) {
    return (
        <div class="note">
            <div class="note-header">
                <span onClick={() => {
                    const currentVideo = document.getElementsByTagName("video")[0];
                    currentVideo.currentTime = time;
                }} style={{ cursor: "pointer", fontWeight: "bold" }}>{formatTime(time)}</span>

                <div class="note-controls">
                    <button onClick={onDelete}>Delete</button>
                </div>
            </div>
            <span>{note}</span>
        </div>
    );
}
