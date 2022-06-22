import React, { useState } from "react";

import Input from "../../components/input";

import styles from "./Mail.module.css";

function EditEmail() {
  const profile = JSON.parse(sessionStorage.getItem("profile"));

  const [recipient, setRecipient] = useState("");
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
    const obj = {
      subject,
      sender: profile.email,
      recipient,
      body,
      key: "",
    };
    console.log("email", obj);
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
          placeholder="Enter email"
          value={recipient}
          onChange={(event) => setRecipient(event.target.value)}
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
