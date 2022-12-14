import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { v4 as uuid } from "uuid";

import Input from "../../../components/input";
import useGunContext from "../../../context/useGunContext";
import { selectOpenMail, selectedMessage } from "../../../slices/mailSlice";
import { selectCurrentUser } from "../../../slices/userSlice";
import {
  getCurrentUserAlias,
  getCurrentUserFirstAndLastNames,
} from "../../../util/user";
import { createEmail } from "../logic/mail";

import styles from "../Mail.module.css";

function ReplyToAll() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const { getGun, getUser, getMails } = useGunContext();
  const selectedMail = useSelector(selectOpenMail);
  const messageToReply = useSelector(selectedMessage);

  const [currentFirstAndLastNames, setCurrentFirstAndLastNames] = useState({});
  const [from, setFrom] = useState("");
  const [recipient, setRecipient] = useState("");
  const [emailCC, setEmailCC] = useState("");
  const [emailBCC, setEmailBCC] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(async () => {
    const alias = await getCurrentUserAlias(user, getUser);
    setFrom(alias);

    const first_And_LastNames = await getCurrentUserFirstAndLastNames(
      user,
      getUser
    );
    setCurrentFirstAndLastNames(first_And_LastNames);

    setRecipient(messageToReply.sender);
    if (messageToReply.cc) setEmailCC(messageToReply.cc);
    if (messageToReply.bcc) setEmailBCC(messageToReply.bcc);
    setSubject(`Re: ${selectedMail.subject}`);
  }, []);

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
          senderFirstName: currentFirstAndLastNames.firstName,
          senderLastName: currentFirstAndLastNames.lastName,
          cc: messageToReply.recipients,
          conversationId: selectedMail.id.split("/")[1],
          messageId: uuid(),
          messageType: "replyToAll",
        };

        return createEmail(emailObject, context);
      }
    });
  };

  const handleRecipientEmails = (context) => {
    const recipient = `${messageToReply.sender}`;
    const emailObject = {
      subject,
      recipient,
      body,
      sender: from,
      senderFirstName: currentFirstAndLastNames.firstName,
      senderLastName: currentFirstAndLastNames.lastName,
      cc: emailCC,
      bcc: emailBCC,
      conversationId: selectedMail.id.split("/")[1],
      messageId: uuid(),
      messageType: "replyToAll",
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
        <button type="button" className="btn btn-primary" onClick={replyToAll}>
          Reply
        </button>
      </div>
    </div>
  );
}

export default ReplyToAll;
