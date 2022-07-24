import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Gun from "gun/gun";
import { v4 as uuid } from "uuid";

import { closeSendMessage, selectOpenMail, selectedMessage } from "../../../slices/mailSlice";
import useGunContext from "../../../context/useGunContext";
import { encryption } from "../../../util/privacy";
import { createEmail } from "../logic/mail";

import styles from "../Mail.module.css";

function ReplyToAll() {
  const dispatch = useDispatch();
  const account = JSON.parse(sessionStorage.getItem("account"));
  const { getGun, getUser, getMails } = useGunContext();
  const selectedMail = useSelector(selectOpenMail);
  const messageToReply = useSelector(selectedMessage);

  const [recipient, setRecipient] = useState("");
  const [emailCC, setEmailCC] = useState("");
  const [emailBCC, setEmailBCC] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    // setBody(`\n\n\n${selectedMail.body}`);
    // setSubject(`fwd: ${selectedMail.subject}`);
  }, []);

  console.log("recipients", messageToReply.recipients)
  console.log("cc", messageToReply.cc)

  const replyToAll = async () => {
    const context = {
      dispatch,
      getGun,
      getUser,
      getMails,
    };
    // const myAlias = await getCurrentAlias(getUser)
    const ccArray = messageToReply.cc.split(";")
    ccArray.forEach(email => {
      if (email === account.email) {
        console.log("recipient", messageToReply.sender)
        console.log("cc", messageToReply.recipients)
        const recipient = `${messageToReply.sender};`
        const emailObject = {
          sender: account.email,
          recipient,
          body,
          cc: messageToReply.recipients,
          conversationId: selectedMail.id.split("/")[1],
          messageId: uuid(),
          messageType: "replyToAll",
        };
  
        createEmail(emailObject, context);
        // createMails(emailObject);
        return
      }
    });
    const recipient = `${messageToReply.recipients};${messageToReply.sender};`;
    const emailObject = {
      sender: account.email,
      recipient,
      body,
      cc: messageToReply.cc,
      conversationId: selectedMail.id.split("/")[1],
      messageId: uuid(),
      messageType: "replyToAll",
    };
    console.log("emailObject", emailObject)
    createEmail(emailObject, context);
    // createMails(emailObject);
  };

  const createMails = async (emailObject) => {
    const recipientsArray = emailObject?.recipient.split(";");
    for (let i = 0; i < recipientsArray.length; i++) {
      if (recipientsArray[i] === account.email) {
        recipientsArray.splice(i, 1)
      }
    }
    let carbonCopyArray;

    console.log(emailObject.cc)

    if (emailObject.cc) {
      carbonCopyArray = emailObject.cc.split(";");
    }

    const newRecipientArray = recipientsArray.concat(
      carbonCopyArray
    );

    const email = await encryption(
      {
        subject: emailObject.subject,
        sender: emailObject.sender,
        recipients: recipientsArray,
        body: emailObject.body,
        cc: carbonCopyArray,
      },
      getGun,
      getUser
    );

    const conversationId = selectedMail.id.split("/")[1];
    const messageId = uuid();

    await getGun()
      .get("conversations")
      .get(conversationId)
      .put({
        recentBody: email?.encryptedMessage,
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
        type: "replyToAll",
        timestamp: Gun.state(),
      });

    const conversation = getMails().get(conversationId);

    getGun()
      .get("accounts")
      .get(emailObject?.sender)
      .get("folders")
      .get("sent")
      .set(conversation);

      console.log(newRecipientArray)
      for (let i = 0; i < newRecipientArray.length; i++) {
        if (newRecipientArray[i]) {
          getGun()
            .get("accounts")
            .get(newRecipientArray[i])
            .get("folders")
            .get("inbox")
            .set(conversation);
        }
      }

    dispatch(closeSendMessage());
    toast.success("Email sent");
  };

  const getCurrentAlias = async (getUser) => {
    let user
    await getUser()
      .get("alias")
      .once((data) => {
        user = data
      })
    return user
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
