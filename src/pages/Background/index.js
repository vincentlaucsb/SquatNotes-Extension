console.log('This is the background page.');
console.log('Put the background scripts here.');

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        let requestUrl = "";

        switch (request.contentScriptQuery) {
            case "getNotebooks":
                requestUrl = `http://localhost:10000/`;

                fetch(requestUrl)
                    .then(response => response.json())
                    .then(data => sendResponse(data['folders']));

            case "saveNotes":
                requestUrl = `http://localhost:10000/folders/${request.notebook}/videos?youtube=${encodeURIComponent(request.videoURL)}`;

                fetch(requestUrl, {
                    method: "POST",
                    body: request.notes,
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                    .then(response => response.text())
                    .then(price => sendResponse(price));

            default:
                break;
        }

        // Will respond asynchronously.
        return true;
    }
);

console.log("Added onMessage listener", chrome.runtime);