import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import "gun/sea";
import "gun/lib/path.js";

import { IconButton } from "@material-ui/core";
import ReplyIcon from "@material-ui/icons/Reply";
import ReplyAllIcon from "@material-ui/icons/ReplyAll";
import ForwardIcon from "@material-ui/icons/Forward";

import {
  selectOpenMail,
  setReply,
  setReplyToAll,
  setForward,
} from "../../../slices/mailSlice";

import { resetEmailActions, setMessage } from "../../../slices/mailSlice";
import { selectCurrentUser } from "../../../slices/userSlice";
import { getCurrentUserAlias } from "../../../util/user";
import useGunContext from "../../../context/useGunContext";
import { decryptionMessage } from "../../../util/privacy";

import styles from "../Mail.module.css";

function Conversation() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const selectedMail = useSelector(selectOpenMail);
  const { getGun, getUser, getMails } = useGunContext();

  const [messages, setMessages] = useState([]);

  useEffect(async () => {
    dispatch(resetEmailActions());
    getAllMessages(getGun, getMails, getUser);
  }, []);

  const getAllMessages = async (getGun, getMails, getUser) => {
    const alias = await getCurrentUserAlias(user, getUser);

    const conversationNode = getMails()
      .get(selectedMail.id.split("/")[1])
      .get("messages");

    // const conversationProps = getMails()
    //   .get(selectedMail.id.split("/")[1])

    let emailsNum = 0;
    // await conversationProps.once(async (data) => {
    //   subject = data.subject
    // })
    await conversationNode.once(async (data) => {
      emailsNum = Object.keys(data).filter((elem) => elem != "_").length;
    });
    var startTime = performance.now();
    const array = [];
    let counter = 0;
    await conversationNode.map().once(async (data) => {
      const message = await decryptionMessage(
        data,
        getUser,
        alias,
        selectedMail?.keys,
        selectedMail?.senderEpub
      );
      array.push(message);
      counter++;
      if (counter > emailsNum) {
      }
      var endTime = performance.now();
      if (counter == emailsNum) {
        var endTime = performance.now();
        console.log(
          `Call to doSomething took ${endTime - startTime} milliseconds`
        );
        array.sort((a, b) => {
          return a.timestamp - b.timestamp;
        });

        setMessages([...array]);
      }
    });
  };

  if (!messages.length) {
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
              <h6>
                To: <b>{`<${message.recipients}>`}</b>
              </h6>
              <h6>
                cc: <b>{`<${message.cc}>`}</b>
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

            <IconButton
              onClick={() => {
                dispatch(setReplyToAll(true));
                dispatch(setMessage(message));
              }}
            >
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
