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
import { resetEmailActions } from "../../features/mailSlice";

import useGunContext from "../../context/useGunContext";
import { decryptionMessage } from "../../util/privacy";
import "gun/sea";
import "gun/lib/path.js";

import styles from "./Mail.module.css";

function ReadEmail() {
  const { getGun, getUser, getMails } = useGunContext();
  const profile = JSON.parse(sessionStorage.getItem("profile"));

  const selectedMail = useSelector(selectOpenMail);
  const dispatch = useDispatch();
  const [message, setMessage] = useState([]);

  console.log(selectedMail);

  async function getCurrentUserAlias(getUser) {
    let name;
    await getUser()
      .get("alias")
      .once((alias) => {
        console.log(alias)
        name = alias;
      });
    return name;
  }

  async function getAllMessages(getGun, getMails, getUser, profile) {
    const alias = await getCurrentUserAlias(getUser)

    await getMails()
      .get(selectedMail.id.split("/")[1])
      .get("messages")
      .once(async (data) => {
        delete data.label;
        const Array = Object.keys(data).slice(1);
        console.log(Array);

        var startTime = performance.now();
        if (Array.length) {
          const yy = [];
          for (let i = 0; i < Array.length; i++) {
            const msg = await decryptionMessage(
              Array[i],
              getGun,
              getUser,
              alias,
              selectedMail.keys,
              selectedMail.senderEpub
            );
            console.log(msg)
            msg.id = Array[i];
            yy.push(msg);
          }
          setMessage(yy);
          var endTime = performance.now();
          console.log(
            `Call to doSomething took ${endTime - startTime} milliseconds`
          );
        }
      });
  }

  useEffect(async () => {
    dispatch(resetEmailActions());
    getAllMessages(getGun, getMails, getUser, profile);
  }, []);

  return (
    <div className={styles["mail-body"]}>
      <div className={styles["mail-bodyHeader"]}>
        <div className={styles["mail-subject"]}>
          <div>
            <h5>{selectedMail.subject}</h5>
            <br />
            <h6>
              From: <b>{`<${selectedMail.sender}>`}</b>
            </h6>
          </div>

          {/* <LabelImportantIcon className={styles["mail-important"]} /> */}
        </div>
        <div className="">
          <IconButton onClick={() => dispatch(setReply(true))}>
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
        <p>{selectedMail.body}</p>
      </div>
    </div>
  );
}

export default ReadEmail;
