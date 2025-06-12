import React, { useEffect, useState } from "react";
import Plugin from "../Plugin";
import MockupHousing from "./MockupHousing";
import { v4 as uuid } from "uuid";

export default function MessageMockup() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const serialised_history = localStorage.getItem("history");
    if (!serialised_history) {
      return;
    }
    setHistory(JSON.parse(serialised_history));
  }, []);

  useEffect(() => {
    const serialised_history = JSON.stringify(history);
    localStorage.setItem("history", serialised_history);
  }, [history]);

  const getData = () => (data ? data.message : null);

  const getDataHistory = () => history;

  const getUserLocal = () => "1";
  const getUserRemote = () => "2";

  const getSender = () => (data ? data.sender : null);

  const isMeLocal = () => (data ? data.sender === "1" : false);
  const isMeRemote = () => (data ? data.sender === "2" : false);

  const sendCreateMessageLocal = (
    /** @type {any} */ msg,
    /** @type {boolean} */ persist = true
  ) => {
    const fullStruct = {
      sender: "1",
      message: msg,
      messageID: uuid(),
    };
    setData(fullStruct);
    persist && setHistory([...history, fullStruct]);
  };

  const sendCreateMessageRemote = (
    /** @type {any} */ msg,
    /** @type {boolean} */ persist = true
  ) => {
    const fullStruct = {
      sender: "2",
      message: msg,
      messageID: uuid(),
    };
    setData(fullStruct);
    persist && setHistory([...history, fullStruct]);
  };

  const sendUpdateMessage = (
    /** @type {Object} */ newMessage,
    /** @type {String} */ id
  ) => {
    setHistory((prevHist) =>
      prevHist.map((item) =>
        item.messageID === id ? { ...item, message: newMessage } : item
      )
    );
  };

  const sendDeleteMessage = (/** @type {String} */ id) => {
    setHistory((prevHist) => prevHist.filter((item) => item.messageID !== id));
  };

  return (
    <div style={{ display: "flex" }}>
      <MockupHousing number={1} style={{ marginRight: "100px" }}>
        <Plugin
          getData={getData}
          getDataHistory={getDataHistory}
          getSender={getSender}
          getUser={getUserLocal}
          isMe={isMeLocal}
          sendCreateMessage={sendCreateMessageLocal}
          sendUpdateMessage={sendUpdateMessage}
          sendDeleteMessage={sendDeleteMessage}
        />
      </MockupHousing>
      <MockupHousing number={2} style={{ marginLeft: "100px" }}>
        <Plugin
          getData={getData}
          getDataHistory={getDataHistory}
          getSender={getSender}
          getUser={getUserRemote}
          isMe={isMeRemote}
          sendCreateMessage={sendCreateMessageRemote}
          sendUpdateMessage={sendUpdateMessage}
          sendDeleteMessage={sendDeleteMessage}
        />
      </MockupHousing>
    </div>
  );
}
