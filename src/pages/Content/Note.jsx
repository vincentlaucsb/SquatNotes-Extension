import React, { Component } from 'react';

export function Note({ onDelete, time, note }) {
    return (
        <div class="note">
            <div class="note-header">
                {time}

                <div class="note-controls">
                    <button onClick={onDelete}>[delete]</button>
                </div>
            </div>
            <span>{note}</span>
        </div>
    );
}
