import React from 'react';
import './Popup.scss';
import useThemeStyle from '../Theme';

function Popup() {
  useThemeStyle();

  let [data, setData] = React.useState({});
  let videoURLs = [];
  for (let key of Object.keys(data)) {
    if (key.startsWith('notes-')) {
      videoURLs.push([data[key].title, key.replace('notes-', '')]);
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
        Press <strong>Ctrl + S</strong> on&nbsp;
        <a href="https://www.youtube.com" target="_blank">YouTube</a> or&nbsp;
        <a href="https://www.rumble.com" target="_blank">Rumble</a> to take notes
      </p>
    </div>
  );
};

export default Popup;
