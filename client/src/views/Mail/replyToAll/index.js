import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { v4 as uuid } from "uuid";

import useGunContext from "../../../context/useGunContext";
import { selectOpenMail, selectedMessage } from "../../../slices/mailSlice";
import { selectCurrentUser } from "../../../slices/userSlice";
import { getCurrentUserAlias } from "../../../util/user";
import { createEmail } from "../logic/mail";

import styles from "../Mail.module.css";

function ReplyToAll() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const { getGun, getUser, getMails } = useGunContext();
  const selectedMail = useSelector(selectOpenMail);
  const messageToReply = useSelector(selectedMessage);

  const [from, setFrom] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    // setBody(`\n\n\n${selectedMail.body}`);
    // setSubject(`fwd: ${selectedMail.subject}`);
    const alias = await getCurrentUserAlias(user, getUser);
    setFrom(alias);
  }, []);

  console.log("recipients", messageToReply.recipients);
  console.log("cc", messageToReply.cc);

  const replyToAll = async () => {
    const context = {
      dispatch,
      getGun,
      getUser,
      getMails,
    };

    handleCCEmails(context);
    handleRecipientEmails(context);
  };

  const handleCCEmails = (context) => {
    const ccArray = messageToReply.cc.split(";");
    ccArray.forEach((email) => {
      if (email === from) {
        const recipient = `${messageToReply.sender};`;
        const emailObject = {
          recipient,
          body,
          sender: from,
          cc: messageToReply.recipients,
          conversationId: selectedMail.id.split("/")[1],
          messageId: uuid(),
          messageType: "replyToAll",
        };

        return createEmail(emailObject, context);
      }
    });
  }

  const handleRecipientEmails = (context) => {
    const recipient = `${messageToReply.recipients};${messageToReply.sender};`;
    const emailObject = {
      recipient,
      body,
      sender: from,
      cc: messageToReply.cc,
      conversationId: selectedMail.id.split("/")[1],
      messageId: uuid(),
      messageType: "replyToAll",
    };
    createEmail(emailObject, context);
  }

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
