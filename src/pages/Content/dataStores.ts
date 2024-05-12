import { useSyncExternalStore } from "react";
import { BaseStore } from "../dataStores";

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

export { NotebookStore };

export function useNotebooks() {
    return useSyncExternalStore(NotebookStore.subscribe, NotebookStore.getSnapshot);
}