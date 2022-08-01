import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { v4 as uuid } from "uuid";

import Input from "../../../components/input";
import { selectOpenMail, selectedMessage } from "../../../slices/mailSlice";
import { selectCurrentUser } from "../../../slices/userSlice";
import {
  getCurrentUserAlias,
  getCurrentUserFirstAndLastNames,
} from "../../../util/user";
import useGunContext from "../../../context/useGunContext";
import { createEmail } from "../logic/mail";

import styles from "../Mail.module.css";

function Reply() {
  const dispatch = useDispatch();
  const { getGun, getUser, getMails } = useGunContext();
  const user = useSelector(selectCurrentUser);
  const selectedMail = useSelector(selectOpenMail);
  const messageToReply = useSelector(selectedMessage);

  const [currentFirstAndLastNames, setCurrentFirstAndLastNames] = useState({});
  const [from, setFrom] = useState("");

  const [recipient, setRecipient] = useState("");
  const [emailCC, setEmailCC] = useState("");
  const [emailBCC, setEmailBCC] = useState("");
  
  const [body, setBody] = useState("");

  useEffect(async () => {
    const alias = await getCurrentUserAlias(user, getUser);
    setFrom(alias);

    const first_And_LastNames = await getCurrentUserFirstAndLastNames(
      user,
      getUser
    );
    setCurrentFirstAndLastNames(first_And_LastNames);
    console.log("messageToReply", messageToReply);
    setRecipient(messageToReply.sender);
    if (messageToReply.cc) setEmailCC(messageToReply.cc);
    if (messageToReply.bcc) setEmailBCC(messageToReply.bcc);
  }, []);

  const sendEmail = () => {
    const emailObject = {
      sender: from,
      senderFirstName: currentFirstAndLastNames.firstName,
      senderLastName: currentFirstAndLastNames.lastName,
      recipient,
      cc: emailCC,
      bcc: emailBCC,
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
            <b>{from}</b>
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
