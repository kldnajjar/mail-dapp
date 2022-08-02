import { encryption } from "../../../util/privacy";
import {
  getMailEmails,
  handleConversationAndMessages,
  createMessagesWithRelatedConversation,
} from "./send";
import { isValidEmails } from "./validation";

export const createEmail = async (emailObject, context) => {
  const { getGun, getUser } = context;
  const isReply = emailObject.messageType === "reply" ? true : false;

  const emailsArray = getMailEmails(emailObject);
  const isValid = await isValidEmails(emailsArray, getGun);

  if (!isValid) return;

  const obj = {
    subject: emailObject.subject,
    sender: emailObject.sender,
    body: emailObject.body,
    keys: emailObject.keys,
    recipients: emailsArray.recipientsArray,
    cc: emailsArray.carbonCopyArray,
    bcc: emailsArray.blindCarbonCopyArray,
  };

  

  let emailParam = {
    encryptedMessage: obj?.body,
    encryptedSubject: obj?.subject,
    encryptedUsersKeys: {},
    sender: obj?.sender,
    senderEpub: "",
  };
  if (process.env.APP_WITH_ENCRYPTION === "true") {
    emailParam = await encryption(obj, getGun, getUser, isReply);
  }
  const msgObj = await handleConversationAndMessages(
    emailObject,
    emailParam,
    emailsArray
  );
  createMessagesWithRelatedConversation(
    context,
    msgObj,
    emailObject,
    emailsArray
  );
};
