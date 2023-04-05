const BACKEND_URL = "http://localhost:10000/";

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        let requestUrl = "";

        switch (request.contentScriptQuery) {
            case "getFrontendPort":
                requestUrl = `${BACKEND_URL}frontendPort`;

                fetch(requestUrl)
                    .then(response => response.json())
                    .then(data => sendResponse(data))
                    .catch(() => sendResponse(null));

                break;

            case "getNotebooks":
                requestUrl = BACKEND_URL;

                fetch(requestUrl)
                    .then(response => response.json())
                    .then(data => sendResponse(data['folders']))
                    .catch(() => sendResponse(null));

                break;

            case "getProgress":
                requestUrl = request.url;

                fetch(requestUrl)
                    .then(response => response.json())
                    .then(data => sendResponse(data));

                break;

            case "saveNotes":
                requestUrl = `${BACKEND_URL}folders/${request.notebook}/videos?youtube=${encodeURIComponent(request.videoURL)}`;

                fetch(requestUrl, {
                    method: "POST",
                    body: request.notes,
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                    .then(response => response.json())
                    .then(data => sendResponse(data));

                break;

            default:
                break;
        }

        // Will respond asynchronously.
        return true;
    }
);