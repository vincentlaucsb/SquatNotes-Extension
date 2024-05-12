/** Find the largest video currently on the page */
export default function getVideo() {
    const videos = document.getElementsByTagName("video");

    let currentVideo: HTMLVideoElement = null;
    let maxArea = 0;

    for (let i = 0; i < videos.length; i++) {
        const video = videos[0];
        const videoArea = video.clientWidth * video.clientHeight;

        if (videoArea > maxArea) {
            maxArea = videoArea;
            currentVideo = video;
        }
    }

    return currentVideo;
}