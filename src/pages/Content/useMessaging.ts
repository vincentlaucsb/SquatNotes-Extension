import { useEffect } from "react";

import { ThemeStore } from '../dataStores';
import { AppCommands, MESSAGE_TYPE } from './communication';

export default function useMessaging() {
    function messageHandler(event) {
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
    }

    useEffect(() => {
        window.addEventListener('message', messageHandler, false);

        return (() => {
            window.removeEventListener('message', messageHandler);
        });
    }, []);
}