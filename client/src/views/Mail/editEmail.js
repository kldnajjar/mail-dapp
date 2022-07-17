import React, { useState } from "react";
import { toast } from "react-toastify";

import { useDispatch } from "react-redux";
import { closeSendMessage } from "../../features/mailSlice";

import Input from "../../components/input";
import useGunContext from "../../context/useGunContext";
import { encryption } from "../../util/privacy";

import styles from "./Mail.module.css";
import { v4 as uuid } from "uuid";

// import { createMails } from "./createEmail";

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

    const conversationId = uuid();
    const messageId = uuid();
    
    createMails(emailObject, conversationId, messageId);
  };

  const generateEmails =()=>{
    let subject = "subject";
    let body = "body";
    for(let i  = 0 ; i < 100 ; i++) {
      const emailObject = {
        subject : `${subject} ${i}`,
        sender: profile.email,
        recipient : "tsar@mykloud.io",
        cc: "",
        bcc: "",
        body : `${body} ${i}`,
      };
      createMails(emailObject);
    }
  }

  const createMails = async (emailObject, conversationId, messageId) => {
    const recipientsArray = emailObject.recipient.split(";");
    let carbonCopyArray;
    let blindCarbonCopyArray;

    if (emailObject.cc.length) {
      carbonCopyArray = emailObject.cc.split(";");
    }

    if (emailObject.bcc.length) {
      blindCarbonCopyArray = emailObject.bcc.split(";");
    }

    const newRecipientArray = recipientsArray.concat(carbonCopyArray, blindCarbonCopyArray)

    const email = await encryption({
        subject: emailObject.subject,
        sender: emailObject.sender,
        recipients: recipientsArray,
        body: emailObject.body,
        cc: carbonCopyArray,
        bcc: blindCarbonCopyArray
      },
      getGun,
      getUser
    );
    // const conversationId = uuid();
    // const messageId = uuid();

    const jsonObj = JSON.stringify(email?.encryptedUsersKeys);
    const carbonCopyJsonObj = JSON.stringify(carbonCopyArray);
    const blindCarbonCopyJsonObj = JSON.stringify(blindCarbonCopyArray);

    await getMails()
      .get(conversationId)
      .put({
        id: conversationId,
        subject: email?.encryptedSubject,
        recentBody: email?.encryptedMessage,
        keys: jsonObj,
        sender: emailObject?.sender,
        senderEpub: email?.senderEpub,
        cc: typeof carbonCopyJsonObj === "undefined" ? "" : carbonCopyJsonObj,
        bcc: typeof blindCarbonCopyJsonObj === "undefined" ? "" : blindCarbonCopyJsonObj
      })
      .get("messages")
      .get(messageId)
      .put({
        id: messageId,
        body: email?.encryptedMessage,
        sender: emailObject?.sender,
        recipients: emailObject?.recipient,
        carbonCopy: emailObject?.cc,
        blindCarbonCopy: emailObject?.bcc,
        type: "",
      });

    const conversation = getMails().get(conversationId);

    getGun()
      .get("profiles")
      .get(emailObject.sender)
      .get("folders")
      .get("sent")
      .set(conversation);

    for (let i = 0; i < newRecipientArray.length; i++) {
      getGun()
        .get("profiles")
        .get(newRecipientArray[i])
        .get("folders")
        .get("inbox")
        .set(conversation);
    }

    dispatch(closeSendMessage());
    toast.success("Email sent");
  };

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

        <button onClick={generateEmails}>generate</button>
      </div>
    </div>
  );
}

export default EditEmail;
