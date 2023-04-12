import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';

import Sidebar from "./Sidebar";

(async function () {
    'use strict';

    const frontendPort = await chrome.runtime.sendMessage({
        contentScriptQuery: "getFrontendPort"
    });

    const body = document.body;

    const reactContainer = document.createElement("div");
    body.appendChild(reactContainer);

    let root = createRoot(reactContainer);
    root.render(<Sidebar {... { frontendPort }} />);

    let currentUrl = window.location.href;
    setInterval(() => {
        if (currentUrl !== window.location.href) {
            currentUrl = window.location.href;
            root.unmount();
            root = createRoot(reactContainer);
            root.render(<Sidebar {... { frontendPort }} />);
        }
    }, 1000);
})();