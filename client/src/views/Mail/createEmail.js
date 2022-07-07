import { encryption } from "../../util/privacy";
import { closeSendMessage } from "../../features/mailSlice";
import { toast } from "react-toastify";
import useGunContext from "../../context/useGunContext";
// import { useDispatch } from "react-redux";

// const dispatch = useDispatch();
const { getGun, getUser, getMails } = useGunContext();

export const createMails = async (emailObject, conversationId, messageId) => {
  const recipientsArray = emailObject.recipient.split(";");
  let carbonCopyArray;
  let blindCarbonCopyArray;

  if (emailObject.cc.length) {
    carbonCopyArray = emailObject.cc.split(";");
  }

  if (emailObject.bcc.length) {
    blindCarbonCopyArray = emailObject.bcc.split(";");
  }

  const newRecipientArray = recipientsArray.concat(carbonCopyArray, blindCarbonCopyArray)

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
      bcc: typeof blindCarbonCopyJsonObj === "undefined" ? "" : blindCarbonCopyJsonObj
    })
    .get("messages")
    .get(messageId)
    .put({
      id: messageId,
      body: email?.encryptedMessage,
      sender: emailObject?.sender,
      recipients: emailObject?.recipient,
      carbonCopy: emailObject?.cc,
      blindCarbonCopy: emailObject?.bcc
    });

  const conversation = getMails().get(conversationId);

  getGun()
    .get("profiles")
    .get(emailObject.sender)
    .get("folders")
    .get("sent")
    .set(conversation);

  for (let i = 0; i < newRecipientArray.length; i++) {
    getGun()
      .get("profiles")
      .get(newRecipientArray[i])
      .get("folders")
      .get("inbox")
      .set(conversation);
  }

  dispatch(closeSendMessage());
  toast.success("Email sent");
};