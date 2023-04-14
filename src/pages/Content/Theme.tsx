export default function Theme({ dark }) {
    const root = document.querySelector(":root") as Element;

    if (dark) {
        root.style.setProperty('--squatnotes-background', 'hsl(0, 0%, 15%)');
        root.style.setProperty('--squatnotes-color', 'hsl(0, 0%, 90%)');
    }
    else {
        root.style.setProperty('--squatnotes-background', '#ffffff');
        root.style.setProperty('--squatnotes-color', 'hsl(0, 0%, 5%)');
    }

    return null;
}