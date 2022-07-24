import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { v4 as uuid } from "uuid";

import { selectOpenMail, selectedMessage } from "../../../slices/mailSlice";
import { selectCurrentUser } from "../../../slices/userSlice";
import { getCurrentUserAlias } from "../../../util/user";
import useGunContext from "../../../context/useGunContext";
import { createEmail } from "../logic/mail";

import styles from "../Mail.module.css";

function Reply() {
  const dispatch = useDispatch();
  const { getGun, getUser, getMails } = useGunContext();
  const user = useSelector(selectCurrentUser);
  const selectedMail = useSelector(selectOpenMail);
  const messageToReply = useSelector(selectedMessage);

  const [from, setFrom] = useState("");
  const [body, setBody] = useState("");

  useEffect(async () => {
    // setBody(`\n\n\n${selectedMail.body}`);
    // setSubject(`fwd: ${selectedMail.subject}`);
    const alias = await getCurrentUserAlias(user, getUser);
    setFrom(alias);
  }, []);

  const sendEmail = () => {
    const recipient = messageToReply.sender;
    const emailObject = {
      sender: from,
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

  // if (!alias) return null;

  return (
    <div className={styles["mail-body"]}>
      <div className={`${styles["edit-mail-header"]}`}>
        <div className="form-group mb-3">
          <label>From</label>
          <div className="mb-3">
            <b>{from}</b>
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
        <button type="button" className="btn btn-primary" onClick={sendEmail}>
          Reply
        </button>
      </div>
    </div>
  );
}

export default Reply;
