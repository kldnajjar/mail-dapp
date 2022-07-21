import { encryption } from "../../../util/privacy";
import { closeSendMessage } from "../../../slices/mailSlice";
import { toast } from "react-toastify";
import Gun from "gun/gun";

export const createEmail = async (emailObject, context) => {
  const emailsArray = getMailEmails(emailObject);

  const email = await encryption(
    {
      subject: emailObject.subject,
      sender: emailObject.sender,
      recipients: emailsArray.recipientsArray,
      body: emailObject.body,
      cc: emailsArray.carbonCopyArray,
      bcc: emailsArray.blindCarbonCopyArray,
    },
    context.getGun,
    context.getUser
  );

  const msgObj = await handleConversationAndMessages(
    emailObject,
    email,
    emailsArray
  );

  createMessagesWithRelatedConversation(context, msgObj, emailObject);
};

const getMailEmails = (obj) => {
  const recipientsArray = obj.recipient.split(";");

  let carbonCopyArray;
  if (obj.cc.length) {
    carbonCopyArray = obj.cc.split(";");
  }

  let blindCarbonCopyArray;
  if (obj.bcc.length) {
    blindCarbonCopyArray = obj.bcc.split(";");
  }

  return {
    recipientsArray,
    carbonCopyArray,
    blindCarbonCopyArray,
  };
};

const handleConversationAndMessages = (emailObject, email, emailsArray) => {
  const jsonObj = JSON.stringify(email?.encryptedUsersKeys);
  const carbonCopyJsonObj = JSON.stringify(emailsArray.carbonCopyArray);
  const blindCarbonCopyJsonObj = JSON.stringify(
    emailsArray.blindCarbonCopyArray
  );

  const conversationObj = {};
  const messageObj = {};

  conversationObj.id = emailObject.conversationId;
  conversationObj.recentBody = email?.encryptedMessage;

  messageObj.id = emailObject.messageId;
  messageObj.type = emailObject.messageType;
  messageObj.body = email?.encryptedMessage;
  messageObj.sender = emailObject?.sender;
  messageObj.recipients = emailObject?.recipient;
  messageObj.timestamp = Gun.state();

  if (messageObj.type !== "reply") {
    conversationObj.subject = email?.encryptedSubject;
    conversationObj.keys = jsonObj;
    conversationObj.sender = emailObject?.sender;
    conversationObj.senderEpub = email?.senderEpub;
    conversationObj.cc =
      typeof carbonCopyJsonObj === "undefined" ? "" : carbonCopyJsonObj;
    conversationObj.bcc =
      typeof blindCarbonCopyJsonObj === "undefined"
        ? ""
        : blindCarbonCopyJsonObj;

    messageObj.carbonCopy = emailObject?.cc;
    messageObj.blindCarbonCopy = emailObject?.bcc;
  }

  const newRecipientArray = emailsArray.recipientsArray.concat(
    emailsArray.carbonCopyArray,
    emailsArray.blindCarbonCopyArray
  );

  return {
    conversationObj,
    messageObj,
    newRecipientArray,
  };
};

const createMessagesWithRelatedConversation = async (
  context,
  mailObj,
  emailObject
) => {
  await context
    .getMails()
    .get(mailObj.conversationObj.id)
    .put(mailObj.conversationObj)
    .get("messages")
    .get(mailObj.messageObj.id)
    .put(mailObj.messageObj);

  const conversation = context.getMails().get(mailObj.conversationObj.id);

  console.log(emailObject.sender);
  console.log(mailObj.newRecipientArray);
  context
    .getGun()
    .get("accounts")
    .get(emailObject.sender)
    .get("folders")
    .get("sent")
    .set(conversation);

  for (let i = 0; i < mailObj.newRecipientArray.length; i++) {
    console.log("before if statement", mailObj.newRecipientArray[i]);
    if (typeof mailObj.newRecipientArray[i] !== "undefined") {
      console.log("after if statement", mailObj.newRecipientArray[i]);
      context
        .getGun()
        .get("accounts")
        .get(mailObj.newRecipientArray[i])
        .get("folders")
        .get("inbox")
        .set(conversation);
    }
  }

  context.dispatch(closeSendMessage());
  toast.success("Email sent");
};
