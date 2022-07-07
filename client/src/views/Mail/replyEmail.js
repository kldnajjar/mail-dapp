import { v4 as uuid } from "uuid";
import { createMails } from "./createEmail";

const profile = JSON.parse(sessionStorage.getItem("profile"));

export async function reply(conversationId, recipient) {
  const emailObject = {
    sender: profile.email,
    recipient,
    body,
  };

  const messageId = uuid();

  createMails(emailObject, conversationId, messageId)
}