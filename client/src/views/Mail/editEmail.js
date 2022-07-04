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

    const recipientsArray = emailObject.recipient.split(";")

    const email = await encryption({ subject : emailObject.subject , sender: emailObject.sender , recipients:recipientsArray , body:emailObject.body }, getGun, getUser);
    const conversationId = uuid();
    const messageId = uuid();

    console.log(email)

    await getMails().get(conversationId).put({
      id : conversationId,
      subject : email?.encryptedSubject,
    }).get(messageId).put({
        id : messageId,
        body : email?.encryptedMessage,
        sender : emailObject?.sender,
        recipients : emailObject?.recipient,
        keys : email?.encryptedKeysByUsers
    })

    const conversation = getMails().get(conversationId);
    console.log(conversation)

    getGun().get("profiles").get(emailObject.sender).get("folders").get("sent").set(conversation);

    for(let i = 0; i < recipientsArray.length; i++){
      getGun().get("profiles").get(recipientsArray[i]).get("folders").get("inbox").set(conversation);
    }
    dispatch(closeSendMessage());
    toast.success("Email sent");

    // const senderAlias = await getSenderAlias(getUser)

    // if (!emailObject.recipients.recipient.includes(";")) {
    //   const recipientAlias = await getRecipientAlias(email.recipients.recipient, getGun)

    //   const conversationId = uuid()
    //   const messageId = uuid()
    //   const conversation = await getGun().get("mails").get(conversationId)
    //   getGun().get("mails").get(conversationId).get(messageId).put(email)

    //   getGun().get("profiles").get(senderAlias).get("folders").get("sent").set(conversation)
    //   getGun().get("profiles").get(recipientAlias).get("folders").get("inbox").set(conversation)

    //   dispatch(closeSendMessage());
    //   toast.success("Email sent");
    // } else {
    //   email.recipients.map(async recipient => {
    //     const recipientPub = await getRecipientUserPub(recipient, getGun)
    //   })
    // }
  };

  // Later
  async function getRecipientAlias(recipient, getGun) {
    let name;
    await getGun()
      .get(`~@${recipient}`)
      .map()
      .once((user) => {
        name = user.alias;
      });
    return name;
  }

  // Later
  async function getSenderAlias(getUser) {
    let name;
    await getUser()
      .get("alias")
      .once((alias) => {
        name = alias;
      });
    return name;
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
