import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { v4 as uuid } from "uuid";

import Input from "../../../components/input";
import useGunContext from "../../../context/useGunContext";
import { createEmail } from "../logic/mail";

import styles from "../Mail.module.css";

function Compose() {
  const account = JSON.parse(sessionStorage.getItem("account"));
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
      sender: account.email,
      recipient,
      cc: emailCC,
      bcc: emailBCC,
      body,
      conversationId: uuid(),
      messageId: uuid(),
      messageType: "",
    };

    const context = {
      dispatch,
      getGun,
      getUser,
      getMails,
    };

    createEmail(emailObject, context);
  };

  const generateEmails = () => {
    let subject = "subject";
    let body = "body";
    for (let i = 0; i < 100; i++) {
      const emailObject = {
        subject: `${subject} ${i}`,
        sender: account.email,
        recipient: "tsar@mykloud.io",
        cc: "",
        bcc: "",
        body: `${body} ${i}`,
        conversationId: uuid(),
        messageId: uuid(),
        messageType: "",
      };

      const context = {
        dispatch,
        getGun,
        getUser,
        getMails,
      };

      createEmail(emailObject, context);
    }
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

export default Compose;
