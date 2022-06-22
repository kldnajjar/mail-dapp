import React, { useState } from "react";
import { toast } from "react-toastify";

import { useDispatch } from "react-redux";
import { closeSendMessage } from "../../features/mailSlice";

import Input from "../../components/input";
import useGunContext from "../../context/useGunContext";
import { encryption } from "../../util/privacy";

import styles from "./Mail.module.css";

function EditEmail() {
  const profile = JSON.parse(sessionStorage.getItem("profile"));
  const dispatch = useDispatch();
  const { getGun, getUser, getMails } = useGunContext();

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
    const emailObject = {
      subject,
      sender: profile.email,
      recipient,
      body,
      key: "",
    };
    createMails(emailObject);
  };

  const createMails = async (emailObject) => {
    const newEmail = await encryption(emailObject, getGun, getUser);
    getMails().set(newEmail);
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
