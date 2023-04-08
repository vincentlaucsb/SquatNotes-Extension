import React, { useEffect, useState } from 'react';
import './Options.css';

interface Props {
  title: string;
}


const Options: React.FC<Props> = ({ title }: Props) => {
  let [notesHotkey, setNotesHotkey] = useState<any>(null);

  useEffect(() => {
    chrome.storage.local.get("notes-hotkey").then((result) => {
      console.log("Hotkey", result["notes-hotkey"]);
      setNotesHotkey(result["notes-hotkey"] || "S");
    });
  }, []);

  if (!notesHotkey) {
    return <h1>Loading...</h1>
  }

  return (
    <div className="OptionsContainer">
      <h1>{title} Page</h1>

      <div>
        <h2>Hotkeys</h2>
        <div>
          <strong>Open notetaking panel</strong>
          <div>
            Ctrl + <input type="text" value={notesHotkey}></input>
          </div>
        </div>
      </div>

      <button type="submit">Save</button>
    </div>
  );
};

export default Options;
