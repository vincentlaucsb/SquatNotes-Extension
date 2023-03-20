export function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const secondsTxt = seconds < 10 ? `0${seconds}` : seconds;

    return `${minutes}:${secondsTxt}`;
}