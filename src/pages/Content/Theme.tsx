// @ts-nocheck
// TODO: Remove abov

export enum Theme {
    Light = 0,
    Dark
}

interface ThemeCSSProps {
    theme: Theme
};

export default function ThemeCSS({ theme }: ThemeCSSProps) {
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