// @ts-nocheck
// TODO: Remove abov

import { useSyncExternalStore } from "react";

export enum Theme {
    Light = 0,
    Dark
}

class ThemeStoreImpl {
    theme: string = "light";
    listeners: (() => void)[] = [];

    constructor() {
        this.getTheme();
    }

    // TODO: Get accurate type for listener
    subscribe = (listener: () => void) => {
        this.listeners = [...this.listeners, listener];

        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
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

    private emitChange() {
        for (let listener of this.listeners) {
            listener();
        }
    }

    private getTheme() {
        chrome.storage.local.get("theme").then((result) => {
            this.theme = result["theme"] || "light";
        });
    }
}

export const ThemeStore = new ThemeStoreImpl();

// TODO: Refactor into a hook once <Sidebar /> is a FC
export default function ThemeCSS() {
    const theme = useSyncExternalStore(ThemeStore.subscribe, ThemeStore.getSnapshot);
    const root = document.querySelector(":root") as Element;

    if (theme === Theme.Dark) {
        root.style.setProperty('--squatnotes-background', 'hsl(0, 0%, 15%)');
        root.style.setProperty('--squatnotes-button-filter', 'invert(1)');
        root.style.setProperty('--squatnotes-color', 'hsl(0, 0%, 90%)');
        root.style.setProperty('--squatnotes-input-bg', 'var(--squatnotes-gray-40)');
    }
    else {
        root.style.setProperty('--squatnotes-background', '#ffffff');
        root.style.setProperty('--squatnotes-button-filter', 'initial');
        root.style.setProperty('--squatnotes-color', 'hsl(0, 0%, 5%)');
        root.style.setProperty('--squatnotes-input-bg', '#ffffff');
    }

    return null;
}