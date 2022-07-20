import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { v4 as uuid } from "uuid";

import Input from "../../../components/input";
import { closeSendMessage, selectOpenMail } from "../../../slices/mailSlice";
import useGunContext from "../../../context/useGunContext";
import { encryption } from "../../../util/privacy";

import styles from "../Mail.module.css";

function Forward() {
  const dispatch = useDispatch();
  const { getGun, getUser, getMails } = useGunContext();
  const account = JSON.parse(sessionStorage.getItem("account"));
  const selectedMail = useSelector(selectOpenMail);

  const [recipient, setRecipient] = useState("");
  const [emailCC, setEmailCC] = useState("");
  const [emailBCC, setEmailBCC] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    setBody(`\n\n\n${selectedMail.body}`);
    setSubject(`fwd: ${selectedMail.subject}`);
  }, []);

  const sendEmail = () => {
    const emailObject = {
      subject,
      sender: account.email,
      recipient,
      cc: emailCC,
      bcc: emailBCC,
      body,
    };

    const conversationId = uuid();
    const messageId = uuid();

    createMails(emailObject, conversationId, messageId);
  };

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

    const newRecipientArray = recipientsArray.concat(
      carbonCopyArray,
      blindCarbonCopyArray
    );

    const email = await encryption(
      {
        subject: emailObject.subject,
        sender: emailObject.sender,
        recipients: recipientsArray,
        body: emailObject.body,
        cc: carbonCopyArray,
        bcc: blindCarbonCopyArray,
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
        bcc:
          typeof blindCarbonCopyJsonObj === "undefined"
            ? ""
            : blindCarbonCopyJsonObj,
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
      });

    const conversation = getMails().get(conversationId);

    getGun()
      .get("accounts")
      .get(emailObject.sender)
      .get("folders")
      .get("sent")
      .set(conversation);

    for (let i = 0; i < newRecipientArray.length; i++) {
      getGun()
        .get("accounts")
        .get(newRecipientArray[i])
        .get("folders")
        .get("inbox")
        .set(conversation);
    }

    dispatch(closeSendMessage());
    toast.success("Email sent");
  };

  /**
   * This reply function is not for this file 'editEmails.js'.
   */
  async function reply(conversationId, recipient) {
    const emailObject = {
      sender: account.email,
      body,
    };

    const messageId = uuid();

    createMails(emailObject, conversationId, messageId);
  }

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
      </div>
    </div>
  );
}

export default Forward;
