import { useSyncExternalStore } from "react";
import { Theme } from "./enums";

class BaseStore {
    listeners: (() => void)[] = [];

    subscribe = (listener: () => void) => {
        this.listeners = [...this.listeners, listener];

        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    protected emitChange() {
        for (let listener of this.listeners) {
            listener();
        }
    }
}

const NotebookStore = new class extends BaseStore {
    notebooks = [];

    constructor() {
        super();
        this.getNotebooks();
        this.getNotebooks = this.getNotebooks.bind(this);
    }

    load = () => {
        this.getNotebooks();
    }

    getSnapshot = () => {
        return this.notebooks;
    }

    private getNotebooks() {
        chrome.runtime.sendMessage({
            contentScriptQuery: "getNotebooks"
        }).then((result) => {
            this.notebooks = result;
        }).catch(() => {
            this.notebooks = [];
        });

        this.emitChange();
    }
}

const ThemeStore = new class extends BaseStore {
    theme: Theme = Theme.Light;
    listeners: (() => void)[] = [];

    constructor() {
        super();
        this.getTheme();
    }

    getSnapshot = () => {
        return this.theme;
    }

    toggleTheme = () => {
        const newTheme = this.theme === Theme.Dark ?
            Theme.Light : Theme.Dark;

        this.theme = newTheme;
        chrome.storage.local.set({ "theme": newTheme });

        this.emitChange();
    }

    private getTheme() {
        chrome.storage.local.get("theme").then((result) => {
            this.theme = result["theme"] || Theme.Light;
        });
    }
}();

export { NotebookStore, ThemeStore };

export function useNotebooks() {
    return useSyncExternalStore(NotebookStore.subscribe, NotebookStore.getSnapshot);
}