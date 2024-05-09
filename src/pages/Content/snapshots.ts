import { SNAPSHOT_WIDTH } from './util';

export function getSnapshotHeight(video: HTMLVideoElement, snapshotWidth: number = SNAPSHOT_WIDTH) {
    const aspectRatio = video.videoWidth / video.videoHeight;
    return snapshotWidth / aspectRatio;
}

/**
 * Given a video, create a PNG data URL for the current frame
 * @param canvas 
 * 
 */
export function getSnapshotData(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    const snapshotHeight = getSnapshotHeight(video);

    // Draw image
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, SNAPSHOT_WIDTH, snapshotHeight);

    // Get data
    const frameData = canvas.toDataURL();

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    return frameData;
}