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

  console.log(isValid);

  if (!isValid) return;

  const obj = {
    subject: emailObject.subject,
    sender: emailObject.sender,
    body: emailObject.body,
    recipients: emailsArray.recipientsArray,
    cc: emailsArray.carbonCopyArray,
    bcc: emailsArray.blindCarbonCopyArray,
  };
  const emailEncrypted = await encryption(obj, getGun, getUser, isReply);

  const msgObj = await handleConversationAndMessages(
    emailObject,
    emailEncrypted,
    emailsArray
  );

  createMessagesWithRelatedConversation(
    context,
    msgObj,
    emailObject,
    emailsArray
  );
};
