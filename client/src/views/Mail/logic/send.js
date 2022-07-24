import { closeSendMessage } from "../../../slices/mailSlice";
import { toast } from "react-toastify";
import Gun from "gun/gun";

const getMailEmails = (obj) => {
  const recipientsArray = obj.recipient.split(";");

  let carbonCopyArray = [];
  if (obj.cc?.length) {
    carbonCopyArray = obj.cc.split(";");
  }

  let blindCarbonCopyArray = [];
  if (obj.bcc?.length) {
    blindCarbonCopyArray = obj.bcc.split(";");
  }

  const newRecipientArray = recipientsArray.concat(
    carbonCopyArray,
    blindCarbonCopyArray
  );

  return {
    recipientsArray,
    carbonCopyArray,
    blindCarbonCopyArray,
    newRecipientArray,
  };
};

const handleConversationAndMessages = (
  emailObject,
  emailEncrypted,
  emailsArray
) => {
  const { conversationId, messageId, messageType, sender, recipient, cc, bcc } =
    emailObject;
  const { encryptedUsersKeys, encryptedMessage, encryptedSubject, senderEpub } =
    emailEncrypted;
  const { carbonCopyArray, blindCarbonCopyArray } = emailsArray;

  const jsonObj = JSON.stringify(encryptedUsersKeys || "");
  const carbonCopyJsonObj = JSON.stringify(carbonCopyArray);
  const blindCarbonCopyJsonObj = JSON.stringify(blindCarbonCopyArray);

  const conversationObj = {};
  const messageObj = {};

  conversationObj.id = conversationId;
  conversationObj.recentBody = encryptedMessage || "";

  messageObj.id = messageId;
  messageObj.type = messageType;
  messageObj.body = encryptedMessage || "";
  messageObj.sender = sender || "";
  messageObj.recipients = recipient || "";
  messageObj.timestamp = Gun.state();

  if (messageObj.type === "reply") {
    return {
      conversationObj,
      messageObj,
    };
  }

  conversationObj.subject = encryptedSubject || "";
  conversationObj.keys = jsonObj;
  conversationObj.senderEpub = senderEpub || "";
  conversationObj.cc = carbonCopyJsonObj ? carbonCopyJsonObj : "";
  conversationObj.bcc = blindCarbonCopyJsonObj ? blindCarbonCopyJsonObj : "";

  messageObj.carbonCopy = cc || "";
  messageObj.blindCarbonCopy = bcc || "";

  return {
    conversationObj,
    messageObj,
  };
};

const createMessagesWithRelatedConversation = async (
  context,
  mailObj,
  emailObject,
  emailsArray
) => {
  const { sender } = emailObject;
  const { newRecipientArray } = emailsArray;
  const { conversationObj, messageObj } = mailObj;
  const { getGun, getMails, dispatch } = context;

  await getMails()
    .get(conversationObj.id)
    .put(conversationObj)
    .get("messages")
    .get(messageObj.id)
    .put(messageObj);

  const conversation = getMails().get(conversationObj.id);

  getGun()
    .get("accounts")
    .get(sender)
    .get("folders")
    .get("sent")
    .set(conversation);

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

export {
  getMailEmails,
  handleConversationAndMessages,
  createMessagesWithRelatedConversation,
};
