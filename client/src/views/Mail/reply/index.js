import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { v4 as uuid } from "uuid";

import { selectOpenMail, selectedMessage } from "../../../slices/mailSlice";
import useGunContext from "../../../context/useGunContext";

import styles from "../Mail.module.css";

function Reply() {
  const dispatch = useDispatch();
  const { getGun, getUser, getMails } = useGunContext();
  const account = JSON.parse(sessionStorage.getItem("account"));
  const selectedMail = useSelector(selectOpenMail);
  const messageToReply = useSelector(selectedMessage);

  const [body, setBody] = useState("");

  useEffect(() => {
    // setBody(`\n\n\n${selectedMail.body}`);
    // setSubject(`fwd: ${selectedMail.subject}`);
  }, []);

  const reply = () => {
    const recipient = selectedMail.sender;

    const emailObject = {
      sender: account.email,
      recipient,
      body,
      conversationId: selectedMail.id.split("/")[1],
      messageId: uuid(),
      messageType: "reply",
    };

    const context = {
      dispatch,
      getGun,
      getUser,
      getMails,
    };

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
            <b>{messageToReply.sender}</b>
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
        <button type="button" className="btn btn-primary" onClick={reply}>
          Reply
        </button>
      </div>
    </div>
  );
}

export default Reply;
