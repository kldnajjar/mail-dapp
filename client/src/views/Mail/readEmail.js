import React, { useState } from "react";
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

import styles from "./Mail.module.css";

function ReadEmail() {
  const selectedMail = useSelector(selectOpenMail);
  // const dispatch = useDispatch();
  // const [message, setMessage] = useState({});

  console.log(selectedMail);

  // // async function getCurrentUserAlias(getUser) {
  // //   let name;
  // //   await getUser()
  // //     .get("alias")
  // //     .once((alias) => {
  // //       name = alias;
  // //     });
  // //   return name;
  // // }

  // async function getAllEmails(getGun, getMails, getUser, profile) {
  //   await getMails()
  //     .get("conversationId")
  //     .get("messages")
  //     .once(async (data) => {
  //       delete data.label;
  //       const Array = Object.keys(data).slice(1);
  //         console.log(Array);

  //         var startTime = performance.now();
  //         if (Array.length) {
  //           const yy = [];
  //           for (let i = 0; i < Array.length; i++) {
  //             const conversation = await decryption(
  //               Array[i],
  //               getGun,
  //               getUser,
  //               profile.email
  //             );
  //             console.log(conversation)
  //             conversation.id = Array[i];
  //             yy.push(conversation);
  //           }
  //           setMessage(yy);
  //           var endTime = performance.now();
  //           console.log(
  //             `Call to doSomething took ${endTime - startTime} milliseconds`
  //           );
  //         }
  //     });
  // }

  // useEffect(async () => {
  //   // dispatch(resetEmailActions());
  //   getAllEmails(getGun, getMails, getUser, profile);
  // }, []);

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
