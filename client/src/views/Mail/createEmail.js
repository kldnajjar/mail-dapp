import React, { useState, useEffect } from "react";
import { encryption } from "../../util/privacy";
import { closeSendMessage } from "../../features/mailSlice";
import { toast } from "react-toastify";
import Gun from "gun/gun";

export const createMails = async (emailObject, conversationObj, messageObj, dispatch, getGun, getUser, getMails) => {
  const recipientsArray = emailObject.recipient.split(";");
  let carbonCopyArray;
  let blindCarbonCopyArray;

  const email = await encryption({
      subject: emailObject.subject,
      sender: emailObject.sender,
      recipients: recipientsArray,
      body: emailObject.body,
      cc: carbonCopyArray,
      bcc: blindCarbonCopyArray
    },
    getGun,
    getUser
  );
  
  const jsonObj = JSON.stringify(email?.encryptedUsersKeys);
  const carbonCopyJsonObj = JSON.stringify(carbonCopyArray);
  const blindCarbonCopyJsonObj = JSON.stringify(blindCarbonCopyArray);

  conversationObj = { recentBody: email?.encryptedMessage }

  messageObj.body = email?.encryptedMessage
  messageObj.sender = emailObject?.sender
  messageObj.recipients = emailObject?.recipient
  messageObj.timestamp = Gun.state()
    
  if (messageObj.type !== "reply")  {
    if (emailObject.cc.length) {
      carbonCopyArray = emailObject.cc.split(";");
    }
  
    if (emailObject.bcc.length) {
      blindCarbonCopyArray = emailObject.bcc.split(";");
    }

    conversationObj.subject = email?.encryptedSubject;
    conversationObj.keys = jsonObj;
    conversationObj.sender = emailObject?.sender;
    conversationObj.senderEpub = email?.senderEpub;
    conversationObj.cc = typeof carbonCopyJsonObj === "undefined" ? "" : carbonCopyJsonObj;
    conversationObj.bcc = typeof blindCarbonCopyJsonObj === "undefined" ? "" : blindCarbonCopyJsonObj;

    messageObj.carbonCopy = emailObject?.cc
    messageObj.blindCarbonCopy = emailObject?.bcc
  }

  const newRecipientArray = recipientsArray.concat(carbonCopyArray, blindCarbonCopyArray)

  await getMails()
    .get(conversationObj.id)
    .put(conversationObj)
    .get("messages")
    .get(messageObj.id)
    .put(messageObj);

  const conversation = getMails().get(conversationObj.id);

  console.log(emailObject.sender)
  console.log(newRecipientArray)
  getGun()
    .get("profiles")
    .get(emailObject.sender)
    .get("folders")
    .get("sent")
    .set(conversation);

  for (let i = 0; i < newRecipientArray.length; i++) {
    console.log("before if statement", newRecipientArray[i])
    if (typeof newRecipientArray[i] !== "undefined") {
      console.log("after if statement", newRecipientArray[i])
      getGun()
        .get("profiles")
        .get(newRecipientArray[i])
        .get("folders")
        .get("inbox")
        .set(conversation);
    }
  }

  dispatch(closeSendMessage());
  toast.success("Email sent");
};