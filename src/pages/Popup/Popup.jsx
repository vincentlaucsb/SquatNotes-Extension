import React from 'react';
import './Popup.scss';

const Popup = () => {
  let [data, setData] = React.useState({});
  let videoURLs = [];
  for (let key of Object.keys(data)) {
    if (key.startsWith('notes-')) {
      videoURLs.push([data[key].title, key.split('-')[1]]);
    }
  }

  React.useEffect(() => {
    chrome.storage.local.get(null).then((data) => {
      setData(data);
    })
  });

  const draftList = videoURLs.length == 0 ? <em>You currently have no saved drafts.</em> : (
    <ul id="drafts">
      {videoURLs.map((url) => {
        return (
          <li><a href={url[1]} target="_blank">{url[0]}</a></li>
        );
      })}
    </ul>
  );

  return (
    <div id="squatnotes">
      <h2>Drafts</h2>
      {draftList}
      <p class="mt-2">Whenever you take notes on a video without saving, they will be listed here for you to come back to.</p>
      <h2 class="mt-3">Shortcuts</h2>
      <p>
        Press <strong>Ctrl + S</strong> on <a href="https://www.youtube.com">YouTube</a> or <a href="https://www.rumble.com">Rumble</a> to take notes
      </p>
    </div>
  );
};

export default Popup;
