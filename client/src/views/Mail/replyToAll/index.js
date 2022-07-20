import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Gun from "gun/gun";
import { v4 as uuid } from "uuid";

import { closeSendMessage, selectOpenMail } from "../../../slices/mailSlice";
import useGunContext from "../../../context/useGunContext";
import { encryption } from "../../../util/privacy";

import styles from "../Mail.module.css";

function ReplyToAll() {
  const dispatch = useDispatch();
  const account = JSON.parse(sessionStorage.getItem("account"));
  const { getGun, getUser, getMails } = useGunContext();
  const selectedMail = useSelector(selectOpenMail);

  const [recipient, setRecipient] = useState("");
  const [emailCC, setEmailCC] = useState("");
  const [emailBCC, setEmailBCC] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    // setBody(`\n\n\n${selectedMail.body}`);
    // setSubject(`fwd: ${selectedMail.subject}`);
  }, []);

  const replyToAll = () => {
    const recipient = selectedMail.sender;

    const emailObject = {
      sender: account.email,
      recipient,
      body,
    };
    createMails(emailObject);
  };

  const createMails = async (emailObject) => {
    const recipientArray = [emailObject?.recipient];

    const email = await encryption(
      {
        subject: emailObject.subject,
        sender: emailObject.sender,
        recipients: recipientArray,
        body: emailObject.body,
      },
      getGun,
      getUser
    );

    const conversationId = selectedMail.id.split("/")[1];
    const messageId = uuid();

    await getMails()
      .get(conversationId)
      .put({
        recentBody: email?.encryptedMessage,
      })
      .get("messages")
      .get(messageId)
      .put({
        id: messageId,
        body: email?.encryptedMessage,
        sender: emailObject?.sender,
        recipients: emailObject?.recipient,
        carbonCopy: "",
        blindCarbonCopy: "",
        type: "reply",
        timestamp: Gun.state(),
      });

    const conversation = getMails().get(conversationId);

    getGun()
      .get("accounts")
      .get(emailObject?.sender)
      .get("folders")
      .get("sent")
      .set(conversation);

    getGun()
      .get("accounts")
      .get(emailObject?.recipient)
      .get("folders")
      .get("inbox")
      .set(conversation);

    dispatch(closeSendMessage());
    toast.success("Email sent");
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
