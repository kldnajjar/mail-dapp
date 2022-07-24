import SEA from "gun/sea";
import { toast } from "react-toastify";

// ENCRYPTION
export async function encryption(email, getGun, getUser, isReply) {
  // TODO
  const encryptionKey = process.env.APP_MAIL_ENCRYPTION_KEY;
  // <-- This key is just an example. Ideally I think we should generate it every time sender sends an email.
  const encryptedSubject = isReply
    ? ""
    : await SEA.encrypt(email.subject, encryptionKey);
  const encryptedMessage = await SEA.encrypt(email.body, encryptionKey);
  const senderEpub = await getUser()._.sea.epub;
  const senderPair = await getUser()._.sea;
  const sender = email.sender;

  const encryptedEncryptionKeySender = await SEA.encrypt(
    encryptionKey,
    await SEA.secret(senderEpub, senderPair)
  );

  const encryptedKeysByUsers = {};
  const encryptedKeysCarbonCopy = {};
  const encryptedKeysBlindCarbonCopy = {};

  encryptedKeysByUsers[sender] = encryptedEncryptionKeySender;
  await getRecipientKeys(
    encryptedKeysByUsers,
    email.recipients,
    getGun,
    encryptionKey,
    senderPair
  );
  if (email?.cc) {
    await getRecipientKeys(
      encryptedKeysCarbonCopy,
      email.cc,
      getGun,
      encryptionKey,
      senderPair
    );
  }
  if (email?.bcc) {
    await getRecipientKeys(
      encryptedKeysBlindCarbonCopy,
      email.bcc,
      getGun,
      encryptionKey,
      senderPair
    );
  }

  const encryptedUsersKeys = {
    encryptedKeysByUsers,
    encryptedKeysCarbonCopy,
    encryptedKeysBlindCarbonCopy,
  };

  return {
    encryptedSubject,
    encryptedMessage,
    encryptedUsersKeys,
    senderEpub,
    sender,
  };
}

async function getRecipientKeys(
  encryptedKeysObj,
  recipients,
  getGun,
  encryptionKey,
  senderPair
) {
  const recipientEpubObj = await getRecipientEpub(recipients, getGun);
  for (const key in recipientEpubObj) {
    const encryptedEncryptionKeyRecipient = await SEA.encrypt(
      encryptionKey,
      await SEA.secret(recipientEpubObj[key], senderPair)
    );

    encryptedKeysObj[key] = encryptedEncryptionKeyRecipient;
  }
}

async function getRecipientEpub(emails, getGun) {
  const epubObj = {};
  for (let i = 0; i < emails.length; i++) {
    let j = i;
    await getGun()
      .get(`~@${emails[i]}`)
      .once((data) => {
        if (!data) {
          return toast.error(`${emails[i]} not exist`);
        }
      })
      .map()
      .once(async (user) => {
        if (!user) {
          return toast.error(`${emails[i]} not exist`);
        }
        epubObj[`${emails[j]}`] = await user.epub;
      });
    return epubObj;
  }
}

// DECRYPTION
export async function decryption(conversation, getUser, currentAlias) {
  const keysObjectJson = JSON.parse(conversation?.keys);
  const keysObject = Object.assign(
    {},
    ...(function _flatten(o) {
      return [].concat(
        ...Object.keys(o).map((k) =>
          typeof o[k] === "object" ? _flatten(o[k]) : { [k]: o[k] }
        )
      );
    })(keysObjectJson)
  );

  const myPair = await getUser()._.sea;

  const decryptedEncryptionKeyForUser = await SEA.decrypt(
    keysObject[currentAlias],
    await SEA.secret(conversation?.senderEpub, myPair)
  );

  const decryptedSubject = await SEA.decrypt(
    conversation?.subject,
    decryptedEncryptionKeyForUser
  );

  const decryptedBody = await SEA.decrypt(
    conversation?.recentBody,
    decryptedEncryptionKeyForUser
  );

  return {
    sender: conversation?.sender,
    subject: decryptedSubject,
    body: decryptedBody,
    senderEpub: conversation?.senderEpub,
    id: `conversations/${conversation?.id}`,
    keys: keysObject,
  };
}

export async function decryptionMessage(
  message,
  getUser,
  alias,
  keys,
  senderEpub
) {
  const myPair = await getUser()._.sea;
  const decryptedEncryptionKeyForUser = await SEA.decrypt(
    keys[alias],
    await SEA.secret(senderEpub, myPair)
  );
  const decryptedBody = await SEA.decrypt(
    message?.body,
    decryptedEncryptionKeyForUser
  );

  return {
    timestamp: message.timestamp,
    body: decryptedBody,
    sender: message?.sender,
    recipients: `${message?.recipients}`,
    cc: `${message?.carbonCopy}`,
  };
}
