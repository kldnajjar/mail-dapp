import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

import { useSelector, useDispatch } from "react-redux";
import { closeSendMessage, selectOpenMail } from "../../../features/mailSlice";

import useGunContext from "../../../context/useGunContext";
import { encryption } from "../../../util/privacy";

import styles from "../Mail.module.css";
import { v4 as uuid } from "uuid";

export async function reply(conversationId, recipient) {
  const emailObject = {
    sender: profile.email,
    recipient,
    body,
  };

  const messageId = uuid();

  createMails(emailObject, conversationId, messageId);
}

function ReplyEmail() {
  const profile = JSON.parse(sessionStorage.getItem("profile"));
  const dispatch = useDispatch();
  const { getGun, getUser, getMails } = useGunContext();

  const selectedMail = useSelector(selectOpenMail);

  const [recipient, setRecipient] = useState("");
  const [emailCC, setEmailCC] = useState("");
  const [emailBCC, setEmailBCC] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const sendEmail = () => {
    const recipient = selectedMail.sender

    const emailObject = {
      subject,
      sender: profile.email,
      recipient,
      body,
    };
    createMails(emailObject);
  };

  const createMails = async (emailObject) => {
    // const recipientsArray = emailObject.recipient.split(";");

    // let carbonCopyArray;
    // let blindCarbonCopyArray;

    // if (emailObject.cc.length) {
    //   carbonCopyArray = emailObject.cc.split(";");
    // }

    // if (emailObject.bcc.length) {
    //   blindCarbonCopyArray = emailObject.bcc.split(";");
    // }

    // const newRecipientArray = recipientsArray.concat(
    //   carbonCopyArray,
    //   blindCarbonCopyArray
    // );

    const recipientArray = [emailObject?.recipient]
    console.log(recipientArray)

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
    const conversationId = uuid();
    const messageId = uuid();

    const jsonObj = JSON.stringify(email?.encryptedUsersKeys);

    await getMails()
      .get(conversationId)
      .put({
        id: conversationId,
        subject: email?.encryptedSubject,
        recentBody: email?.encryptedMessage,
        keys: jsonObj,
        sender: emailObject?.sender,
        senderEpub: email?.senderEpub,
        cc: "",
        bcc: "",
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
        type: "reply"
      });

    const conversation = getMails().get(conversationId);

    getGun()
      .get("profiles")
      .get(emailObject.sender)
      .get("folders")
      .get("sent")
      .set(conversation);

    for (let i = 0; i < 1; i++) {
      getGun()
        .get("profiles")
        .get(emailObject?.recipient)
        .get("folders")
        .get("inbox")
        .set(conversation);
    }

    dispatch(closeSendMessage());
    toast.success("Email sent");
  };

  useEffect(() => {
    setBody(`\n\n\n${selectedMail.body}`);
    // setSubject(`fwd: ${selectedMail.subject}`);
  }, []);

  return (
    <div className={styles["mail-body"]}>
      <div className={`${styles["edit-mail-header"]}`}>
        <div className="form-group mb-3">
          <label>From</label>
          <div className="mb-3">
            <b>{profile.email}</b>
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
        <button type="button" className="btn btn-primary" onClick={sendEmail}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ReplyEmail;
