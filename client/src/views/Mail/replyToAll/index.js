import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Gun from "gun/gun";
import { v4 as uuid } from "uuid";

import { closeSendMessage, selectOpenMail, selectedMessage } from "../../../slices/mailSlice";
import useGunContext from "../../../context/useGunContext";
import { encryption } from "../../../util/privacy";
import { createEmail } from "../logic/mail";

import styles from "../Mail.module.css";

function ReplyToAll() {
  const dispatch = useDispatch();
  const account = JSON.parse(sessionStorage.getItem("account"));
  const { getGun, getUser, getMails } = useGunContext();
  const selectedMail = useSelector(selectOpenMail);
  const messageToReply = useSelector(selectedMessage);

  const [recipient, setRecipient] = useState("");
  const [emailCC, setEmailCC] = useState("");
  const [emailBCC, setEmailBCC] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    // setBody(`\n\n\n${selectedMail.body}`);
    // setSubject(`fwd: ${selectedMail.subject}`);
  }, []);

  console.log("recipients", messageToReply.recipients)
  console.log("cc", messageToReply.cc)

  const replyToAll = async () => {
    const context = {
      dispatch,
      getGun,
      getUser,
      getMails,
    };
    // const myAlias = await getCurrentAlias(getUser)
    const ccArray = messageToReply.cc.split(";")
    ccArray.forEach(email => {
      if (email === account.email) {
        console.log("recipient", messageToReply.sender)
        console.log("cc", messageToReply.recipients)
        const recipient = `${messageToReply.sender};`
        const emailObject = {
          sender: account.email,
          recipient,
          body,
          cc: messageToReply.recipients,
          conversationId: selectedMail.id.split("/")[1],
          messageId: uuid(),
          messageType: "replyToAll",
        };
  
        createEmail(emailObject, context);
        return
      }
    });
    const recipient = `${messageToReply.recipients};${messageToReply.sender};`;
    const emailObject = {
      sender: account.email,
      recipient,
      body,
      cc: messageToReply.cc,
      conversationId: selectedMail.id.split("/")[1],
      messageId: uuid(),
      messageType: "replyToAll",
    };
    console.log("emailObject", emailObject)
    createEmail(emailObject, context);
  };

  return (
    <div className={styles["mail-body"]}>
      <div className={`${styles["edit-mail-header"]}`}>
        <div className="form-group mb-3">
          <label>From</label>
          <div className="mb-3">
            <b>{account.email}</b>
          </div>
        </div>
        <div className="form-group mb-3">
          <label>Recipient</label>
          <div className="mb-3">
            <b>{selectedMail.sender}</b>
          </div>
        </div>
      </div>

      <div className={styles["mail-message"]}>
        <div className="form-group mb-3">
          <textarea
            className="form-control"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={9}
          />
        </div>
      </div>
      <div className="d-grid">
        <button type="button" className="btn btn-primary" onClick={replyToAll}>
          Reply
        </button>
      </div>
    </div>
  );
}

export default ReplyToAll;
