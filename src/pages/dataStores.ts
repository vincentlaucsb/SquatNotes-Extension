import { Theme } from "./enums";

export class BaseStore {
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

export { ThemeStore };