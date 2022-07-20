import React, { useEffect, useState } from "react";
import {
  selectOpenMail,
  setReply,
  setReplyToAll,
  setForward,
} from "../../features/mailSlice";
import { useSelector, useDispatch } from "react-redux";

import { IconButton } from "@material-ui/core";
import ReplyIcon from "@material-ui/icons/Reply";
import ReplyAllIcon from "@material-ui/icons/ReplyAll";
import ForwardIcon from "@material-ui/icons/Forward";
import { resetEmailActions, setMessage } from "../../features/mailSlice";

import useGunContext from "../../context/useGunContext";
import { decryptionMessage } from "../../util/privacy";
import "gun/sea";
import "gun/lib/path.js";

import styles from "./Mail.module.css";

function Conversation() {
  const { getGun, getUser, getMails } = useGunContext();
  const profile = JSON.parse(sessionStorage.getItem("profile"));

  const selectedMail = useSelector(selectOpenMail);
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([]);

  async function getCurrentUserAlias(getUser) {
    let name;
    await getUser()
      .get("alias")
      .once((alias) => {
        name = alias;
      });
    return name;
  }

  async function getAllMessages(getGun, getMails, getUser, profile) {
    const alias = await getCurrentUserAlias(getUser);
    const conversationNode = getMails()
      .get(selectedMail.id.split("/")[1])
      .get("messages");
    let emailsNum = 0;
    await conversationNode.once(async (data) => {
      emailsNum = Object.keys(data).filter((elem)=> elem !="_").length;
    });
    var startTime = performance.now();
    const array = [];
    let counter = 0;
    await conversationNode.map().once(async (data) => {
      const message = await decryptionMessage(
        data,
        getGun,
        getUser,
        alias,
        selectedMail?.keys,
        selectedMail?.senderEpub
      );
      console.log(message);
      array.push(message);
      counter++;
      if (counter > emailsNum) {
      }
      var endTime = performance.now();
      if (counter == emailsNum) {
        console.log("WWW");
        var endTime = performance.now();
        console.log(
          `Call to doSomething took ${endTime - startTime} milliseconds`
        );
        array.sort((a, b) => {
          return a.timestamp - b.timestamp;
        });

        console.log(array)
        setMessages([...array]);
      }
    });

    // const alias = await getCurrentUserAlias(getUser);
    // await getMails()
    //   .get(selectedMail.id.split("/")[1])
    //   .get("messages")
    //   .once(async (data) => {
    //     delete data.label;
    //     const Array = Object.keys(data).slice(1);
    //     var startTime = performance.now();
    //     if (Array.length) {
    //       const yy = [];
    //       for (let i = 0; i < Array.length; i++) {
    //         const refMessage = `${selectedMail.id}/messages/${Array[i]}`;
    //         const msg = await decryptionMessage(
    //           refMessage,
    //           getGun,
    //           getUser,
    //           alias,
    //           selectedMail.keys,
    //           selectedMail.senderEpub
    //         );
    //         msg.id = Array[i];
    //         const date = new Date(msg.timestamp); // Timestamp to Human readable data
    //         yy.push(msg);
    //       }
    //       yy.sort((a, b) => {
    //         return a.timestamp - b.timestamp;
    //       });
    //       setMessages(yy);
    //       var endTime = performance.now();
    //       console.log(
    //         `Call to doSomething took ${endTime - startTime} milliseconds`
    //       );
    //     }
    //   });
  }

  useEffect(async () => {
    dispatch(resetEmailActions());
    getAllMessages(getGun, getMails, getUser, profile);
  }, []);

  if (!messages.length) {
    console.log("QQQ");
    return null;
  }

  return messages.map((message, key) => {
    return (
      <div className={styles["mail-body"]} key={`mail-message-${key}`}>
        <div className={styles["mail-bodyHeader"]}>
          <div className={styles["mail-subject"]}>
            <div>
              <h5>{selectedMail.subject}</h5>
              <br />
              <h6>
                From: <b>{`<${message.sender}>`}</b>
              </h6>
            </div>

            {/* <LabelImportantIcon className={styles["mail-important"]} /> */}
          </div>
          <div className="">
            <IconButton
              onClick={() => {
                dispatch(setReply(true));
                dispatch(setMessage(message));
              }}
            >
              <ReplyIcon />
            </IconButton>

            <IconButton onClick={() => dispatch(setReplyToAll(true))}>
              <ReplyAllIcon />
            </IconButton>

            <IconButton onClick={() => dispatch(setForward(true))}>
              <ForwardIcon />
            </IconButton>
          </div>
          {/* <p className={styles["mail-time"]}>{selectedMail.time}</p> */}
        </div>

        <div className={styles["mail-message"]}>
          <p>{message.body}</p>
        </div>
      </div>
    );
  });
}

export default Conversation;
