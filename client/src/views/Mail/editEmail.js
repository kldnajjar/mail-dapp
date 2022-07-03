import React, { useState } from "react";
import { toast } from "react-toastify";

import { useDispatch } from "react-redux";
import { closeSendMessage } from "../../features/mailSlice";

import Input from "../../components/input";
import useGunContext from "../../context/useGunContext";
import { encryption } from "../../util/privacy";

import styles from "./Mail.module.css";
import { v4 as uuid } from 'uuid';

function EditEmail() {
  const profile = JSON.parse(sessionStorage.getItem("profile"));
  const dispatch = useDispatch();
  const { getGun, getUser, getMails } = useGunContext();

  const [recipient, setRecipient] = useState("");
  const [emailCC, setEmailCC] = useState("");
  const [emailBCC, setEmailBCC] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // let email = {
  //   subject: "Hey",
  //   sender: "tsar@zhuk.com",
  //   recipient: "suleiman@zhukov.com",
  //   body: "Hello, tsar",
  //   key: "",
  // };

  const sendEmail = () => {
    const emailObject = {
      subject,
      sender: profile.email,
      recipient,
      cc: emailCC,
      bcc: emailBCC,
      body,
    };
    createMails(emailObject);
  };

  const createMails = async (emailObject) => {
    const email = await encryption(emailObject, getGun, getUser);

    console.log(email)
    const senderPub = await getSenderUserPub(getUser)
    let recipientPub
    if (!emailObject.recipient.includes(";")) {
      recipientPub = await getRecipientUserPub(email.recipients.recipient, getGun)

      const conversationId = uuid()
      const messageId = uuid()
      const conversation = getGun().get("mails").get(conversationId).get(messageId).put(email)
      // conversation.get(messageId).put(email)
      // console.log(typeof conversation)
      getGun().get("profiles").get(senderPub).get("messages").set(conversation)
      getGun().get("profiles").get(recipientPub).get("messages").set(conversation)

      dispatch(closeSendMessage());
      toast.success("Email sent");
    } else {
      email.recipients.map(recipient => {
        recipientPub = await getRecipientUserPub(recipient, getGun)
      })
    }
  };

  // Later
  async function getRecipientUserPub(recipient, getGun) {
    let recipientPub;
    await getGun()
      .get(`~@${recipient}`)
      .map()
      .once((user) => {
        recipientPub = user.pub;
      });
    return recipientPub;
  }

  // Later
  async function getSenderUserPub(getUser) {
    let pubKey;
    await getUser()
      .get("pub")
      .once((pub) => {
        pubKey = pub;
      });
    return pubKey;
  }

  return (
    <div className={styles["mail-body"]}>
      <div className={`${styles["edit-mail-header"]}`}>
        <div className="form-group mb-3">
          <label>From</label>
          <div className="mb-3">
            <b>{profile.email}</b>
          </div>
        </div>
        <Input
          type="email"
          label="Recipient"
          placeholder="Seperate multiple emails with ;"
          value={recipient}
          onChange={(event) => setRecipient(event.target.value)}
        />
        <Input
          type="email"
          label="CC"
          placeholder="Seperate multiple emails with ;"
          value={emailCC}
          onChange={(event) => setEmailCC(event.target.value)}
        />
        <Input
          type="email"
          label="Bcc"
          placeholder="Seperate multiple emails with ;"
          value={emailBCC}
          onChange={(event) => setEmailBCC(event.target.value)}
        />
        <Input
          type="text"
          label="Subject"
          placeholder="Subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />
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

export default EditEmail;
