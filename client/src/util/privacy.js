import SEA from "gun/sea";
import { toast } from "react-toastify";

// ENCRYPTION
export async function encryption(email, getGun, getUser, getUsersEpub, isReply) {
  // TODO: This key is just an example. Ideally I think we should generate it every time sender sends an email.
  const encryptionKey = process.env.APP_MAIL_ENCRYPTION_KEY;
  const { recipients, sender, subject, body, cc, bcc, keys } = email;

  const encryptedSubject = isReply
    ? ""
    : await SEA.encrypt(subject, encryptionKey);
  const encryptedMessage = await SEA.encrypt(body, encryptionKey);
  const senderEpub = await getUser()._.sea.epub;
  const senderPair = await getUser()._.sea;

  const encryptedEncryptionKeySender = await SEA.encrypt(
    encryptionKey,
    await SEA.secret(senderEpub, senderPair)
  );

  const encryptedKeysByUsers = await getRecipientKeys(
    recipients,
    getGun,
    getUsersEpub,
    encryptionKey,
    senderPair
  );
  encryptedKeysByUsers[sender] = encryptedEncryptionKeySender;

  const encryptedKeysCarbonCopy = cc
    ? await getRecipientKeys(cc, getGun, encryptionKey, senderPair)
    : {};

  const encryptedKeysBlindCarbonCopy = bcc
    ? await getRecipientKeys(bcc, getGun, encryptionKey, senderPair)
    : {};

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

async function getRecipientKeys(recipients, getGun, getUsersEpub, encryptionKey, senderPair) {
  const encryptedKeysObj = {};
  await getGun().get("accounts").get("usersEpub").once(async (data) => {
    // epubKeys = JSON.parse(data?.usersEpub || "{}");
    for (let i = 0; i < recipients.length; i++) {
      const secret = await SEA.secret(data[recipients[i]], senderPair);
      const encryptedEncryptionKeyRecipient = await SEA.encrypt(
        encryptionKey,
        secret
      );
      encryptedKeysObj[recipients[i]] = encryptedEncryptionKeyRecipient;  
    }
  });
  // // TODO: getRecipientEpub change structre
  // const recipientEpubObj = await getRecipientEpub(recipients, getGun);
  // console.log("recipientEpubObj", recipientEpubObj);

  // for (const key in recipientEpubObj) {
  //   const secret = await SEA.secret(recipientEpubObj[key], senderPair);
  //   const encryptedEncryptionKeyRecipient = await SEA.encrypt(
  //     encryptionKey,
  //     secret
  //   );
  //   encryptedKeysObj[key] = encryptedEncryptionKeyRecipient;
  // }
  return encryptedKeysObj;
}

async function getRecipientEpub(emails, getGun) {
  const epubObj = {};

  for (let i = 0; i < emails.length; i++) {
    await getGun()
      .get(`~@${emails[i]}`)
      // .once((data) => {
      //   if (!data) {
      //     return toast.error(`${emails[i]} not exist`);
      //   }
      // })
      .map()
      .once((user) => {
        if (user) {
          epubObj[emails[i]] = user.epub;
        }
      });
    return epubObj;
  }
}

const prepareTheUsersKeys = (keys, encryptedKeysByUsers, encryptedKeysCarbonCopy, encryptedKeysBlindCarbonCopy) => {
  for (const user in encryptedKeysByUsers) {
    for (const key in keys) {
      if (!encryptedKeysByUsers[user] === keys[key]) {
        encryptedKeysByUsers[key] = keys[key];
      }
    }
  }
  for (const user in encryptedKeysCarbonCopy) {
    for (const key in keys) {
      if (!encryptedKeysCarbonCopy[user] === keys[key]) {
        encryptedKeysCarbonCopy[key] = keys[key];
      }
    }
  }
  for (const user in encryptedKeysBlindCarbonCopy) {
    for (const key in keys) {
      if (!encryptedKeysBlindCarbonCopy[user] === keys[key]) {
        encryptedKeysBlindCarbonCopy[key] = keys[key];
      }
    }
  }
}

// DECRYPTION
export async function decryption(conversation, getUser, currentAlias) {
  if(process.env.APP_WITH_ENCRYPTION === "false"){
    return {
      sender: conversation?.sender,
      subject: conversation?.subject,
      body: conversation?.recentBody,
      senderEpub: conversation?.senderEpub,
      id: `conversations/${conversation?.id}`,
      keys: {},
      time: conversation.timestamp,
    };
  }
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
    time: conversation.timestamp,
  };

}

export async function decryptionMessage(
  message,
  getUser,
  alias,
  keys,
  senderEpub
) {

  if(process.env.APP_WITH_ENCRYPTION === "false"){
    return {
      timestamp: message?.timestamp,
      body: message?.body,
      sender: message?.sender,
      allEmails: message.allEmails,
      senderFirstName: message.senderFirstName,
      senderLastName: message.senderLastName,
      recipients: `${message?.recipients}`,
      cc: `${message?.carbonCopy}`,
    };
  }
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
    timestamp: message?.timestamp,
    body: decryptedBody,
    sender: message?.sender,
    allEmails: message.allEmails,
    senderFirstName: message.senderFirstName,
    senderLastName: message.senderLastName,
    recipients: `${message?.recipients}`,
    cc: `${message?.carbonCopy}`,
  };
}
