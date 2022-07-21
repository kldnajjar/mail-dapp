import { encryption } from "../../../util/privacy";
import {
  getMailEmails,
  handleConversationAndMessages,
  createMessagesWithRelatedConversation,
} from "./send";

export const createEmail = async (emailObject, context) => {
  const { getGun, getUser } = context;

  const emailsArray = getMailEmails(emailObject);

  const obj = {
    subject: emailObject.subject,
    sender: emailObject.sender,
    body: emailObject.body,
    recipients: emailsArray.recipientsArray,
    cc: emailsArray.carbonCopyArray,
    bcc: emailsArray.blindCarbonCopyArray,
  };
  const emailEncrypted = await encryption(obj, getGun, getUser);

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
