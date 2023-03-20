console.log('This is the background page.');
console.log('Put the background scripts here.');

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.contentScriptQuery == "saveNotes") {
            const requestUrl = `http://localhost:10000/folders/test/videos?youtube=${encodeURIComponent(request.videoURL)}`;

            console.log("Received request!", request.notes);

            fetch(requestUrl, {
                method: "POST",
                body: request.notes,
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.text())
                .then(price => sendResponse(price));

            return true; // Will respond asynchronously.
        }
    }
);

console.log("Added onMessage listener", chrome.runtime);