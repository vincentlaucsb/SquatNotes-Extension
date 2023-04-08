import React from 'react';
import { formatTime } from './util';

export default function Note({ onDelete, time, note }) {
    return (
        <div class="note">
            <div class="note-header">
                {formatTime(time)}

                <div class="note-controls">
                    <button onClick={onDelete}>Delete</button>
                </div>
            </div>
            <span>{note}</span>
        </div>
    );
}
