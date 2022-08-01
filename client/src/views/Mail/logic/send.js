import { closeSendMessage } from "../../../slices/mailSlice";
import { toast } from "react-toastify";

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

  const allEmails = recipientsArray.concat(
    carbonCopyArray,
    blindCarbonCopyArray
  );

  return {
    recipientsArray,
    carbonCopyArray,
    blindCarbonCopyArray,
    allEmails,
  };
};

const handleConversationAndMessages = (
  emailObject,
  emailEncrypted,
  emailsArray
) => {
  const { conversationId, messageId, messageType, sender, recipient, cc, bcc, senderFirstName, senderLastName } =
    emailObject;
  let updatedRecipient = recipient
  const { encryptedUsersKeys, encryptedMessage, encryptedSubject, senderEpub } =
    emailEncrypted;
  const { carbonCopyArray, blindCarbonCopyArray, allEmails } = emailsArray;

  const allEmailsWithSender = [...allEmails, sender]
  
  const jsonObj = JSON.stringify(encryptedUsersKeys || "");
  
  const carbonCopyJsonObj = JSON.stringify(carbonCopyArray);
  const blindCarbonCopyJsonObj = JSON.stringify(blindCarbonCopyArray);
  const allEmailsObj = JSON.stringify(allEmailsWithSender);

  const conversationObj = {};
  const messageObj = {};

  if (recipient.includes(";")) { updatedRecipient = recipient.replace(";", "") }

  conversationObj.id = conversationId;
  conversationObj.sender = sender || "";
  conversationObj.recentBody = encryptedMessage || "";
  conversationObj.timestamp = new Date().getTime();

  messageObj.id = messageId;
  messageObj.type = messageType;
  messageObj.body = encryptedMessage || "";
  messageObj.sender = sender || "";
  messageObj.senderFirstName = senderFirstName || "";
  messageObj.senderLastName = senderLastName || "";
  messageObj.allEmails = allEmailsObj || "";
  messageObj.recipients = recipient || "";
  messageObj.carbonCopy = cc || "";
  messageObj.blindCarbonCopy = bcc || "";
  messageObj.timestamp = new Date().getTime();

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
  const { allEmails } = emailsArray;
  const { conversationObj, messageObj } = mailObj;
  const { getGun, getMails, dispatch } = context;

  const conversation = getMails().get(conversationObj.id);

  await getMails()
    .get(conversationObj.id)
    .put(conversationObj)
    .get("messages")
    .get(messageObj.id)
    .put(messageObj);

  getGun()
    .get("accounts")
    .get(sender)
    .get("folders")
    .get("sent")
    .set(conversation);

  allEmails.map((recipient) => {
    if (recipient) {
      getGun()
        .get("accounts")
        .get(recipient)
        .get("folders")
        .get("inbox")
        .set(conversation);
    }
  });

  dispatch(closeSendMessage());
  toast.success("Email sent");
};

export {
  getMailEmails,
  handleConversationAndMessages,
  createMessagesWithRelatedConversation,
};
