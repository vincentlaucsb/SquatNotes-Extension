// @ts-nocheck
// TODO: Remove abov

import React, { useSyncExternalStore } from "react";
import { Theme } from "./enums";
import { ThemeStore } from "./dataStores";

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

export function ThemeToggler() {
    const theme = useSyncExternalStore(ThemeStore.subscribe, ThemeStore.getSnapshot);

    return (
        <button id="theme-toggler" onClick={() => {
            ThemeStore.toggleTheme();
        }} title="Click to change theme">
            {theme === Theme.Dark ?
                <img src={chrome.runtime.getURL("moon.png")} alt="Dark Theme" /> :
                <img src={chrome.runtime.getURL("sun-high.png")} alt="Light Theme" />
            }
        </button>
    );
}