import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { v4 as uuid } from "uuid";

import Input from "../../../components/input";
import useGunContext from "../../../context/useGunContext";
import {
  selectOpenMail,
  selectedMessageForward,
} from "../../../slices/mailSlice";
import { selectCurrentUser } from "../../../slices/userSlice";
import { getCurrentUserAlias } from "../../../util/user";
import { createEmail } from "../logic/mail";

import styles from "../Mail.module.css";

function Forward() {
  const dispatch = useDispatch();
  const { getGun, getUser, getMails } = useGunContext();
  const selectedMail = useSelector(selectOpenMail);
  const user = useSelector(selectCurrentUser);
  const selectedMailToForward = useSelector(selectedMessageForward);

  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [emailCC, setEmailCC] = useState("");
  const [emailBCC, setEmailBCC] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    let message = `\n\n\n---------- Forwarded message ---------\nSubject: ${selectedMail.subject}\n\n`;
    let firstName
    let lastName
    for (let i = 0; i < selectedMailToForward.messageArray.length; i++) {
      firstName = selectedMailToForward.messageArray[i].senderFirstName
      lastName = selectedMailToForward.messageArray[i].senderLastName
      message += `On ${moment(message.timestamp).format("ddd, MMMM D, YYYY")} at` +
      `${moment(message.timestamp).format("h:mm A")}, ${firstName} ${lastName} wrote:
      \n${selectedMailToForward.messageArray[i].body}\n\n`;
    }
    setBody(message);
    // setSubject(selectedMail.subject);
  }, []);

  useEffect(async () => {
    const current_user_email = await getCurrentUserAlias(user, getUser);
    setCurrentUserEmail(current_user_email);
  }, []);

  const sendEmail = () => {
    const emailObject = {
      subject,
      sender: currentUserEmail,
      recipient,
      cc: emailCC,
      bcc: emailBCC,
      body,
      keys: selectedMailToForward.keys,
      conversationId: selectedMail.id.split("/")[1],
      messageId: uuid(),
      messageType: "forward",
    };

    const context = {
      dispatch,
      getGun,
      getUser,
      getMails,
    };

    createEmail(emailObject, context);
  };

  if (!currentUserEmail) return null;

  return (
    <div className={styles["mail-body"]}>
      <div className={`${styles["edit-mail-header"]}`}>
        <div className="form-group mb-3">
          <label>From</label>
          <div className="mb-3">
            <b>{currentUserEmail}</b>
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
        {/* <Input
          type="text"
          label="Subject"
          placeholder="Subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        /> */}
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

export default Forward;
