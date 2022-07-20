import gun from "gun/gun";
import "gun/sea";
import SEA from "gun/sea";
import "gun/lib/path.js";
// import regeneratorRuntime from "regenerator-runtime";

// ENCRYPTION
export async function encryption(email, getGun, getUser) {
  const encryptionKey = "mykloud-key"; // <-- This key is just an example. Ideally I think we should generate it every time sender sends an email.
  
  let encryptedSubject
  if (typeof email.subject !== "undefined") {
    encryptedSubject = await SEA.encrypt(email.subject, encryptionKey);
  }
  
  const encryptedMessage = await SEA.encrypt(email.body, encryptionKey);

  const senderEpub = await getUser()._.sea.epub;
  const senderPair = await getUser()._.sea;
  
  const encryptedEncryptionKeySender = await SEA.encrypt(
    encryptionKey,
    await SEA.secret(senderEpub, senderPair)
  );

  const encryptedKeysByUsers = {};
  const encryptedKeysCarbonCopy = {};
  const encryptedKeysBlindCarbonCopy = {};

  encryptedKeysByUsers[email["sender"]] = encryptedEncryptionKeySender;

  await getRecipientKeys(encryptedKeysByUsers, email.recipients, getGun, encryptionKey, senderPair);
  console.log("tsar & plotnik", email)

  if (email?.cc) {
    console.log("CarbonCopy")
    await getRecipientKeys(encryptedKeysCarbonCopy, email.cc, getGun, encryptionKey, senderPair);
  }

  if (email?.bcc) {
    console.log("BlindCarbonCopy")
    await getRecipientKeys(encryptedKeysBlindCarbonCopy, email.bcc, getGun, encryptionKey, senderPair);
  }

  const encryptedUsersKeys = {
    encryptedKeysByUsers,
    encryptedKeysCarbonCopy,
    encryptedKeysBlindCarbonCopy
  };

  return {
    encryptedSubject,
    encryptedMessage,
    encryptedUsersKeys,
    senderEpub,
  };
}

async function getRecipientKeys(encryptedKeysObj, recipients, getGun, encryptionKey, senderPair) {
  const recipientEpubObj = await getRecipientEpub(recipients, getGun);
  for (const key in recipientEpubObj) {
    console.log(recipientEpubObj[key])
    const encryptedEncryptionKeyRecipient = await SEA.encrypt(
      encryptionKey,
      await SEA.secret(recipientEpubObj[key], senderPair)
    );
    encryptedKeysObj[key] = encryptedEncryptionKeyRecipient;
  }
  console.log(encryptedKeysObj)
}

async function getRecipientEpub(emails, getGun) {
  const epubObj = {};
  for (let i = 0; i < emails.length; i++) {
    let j = i;
    await getGun()
      .get(`~@${emails[i]}`)
      .map()
      .once((user) => {
        epubObj[`${emails[j]}`] = user.epub;
      });
    getGun().get(`~@${emails[i]}`).off();
  }
  console.log(epubObj);
  return epubObj;
}

// DECRYPTION
export async function decryption(
  refConversation,
  getGun,
  getUser,
  currentAlias
) {
  const conversation = await getByReference(refConversation, getGun);
  const keysObject = JSON.parse(conversation?.keys);
  console.log(conversation)

  if (typeof keysObject.encryptedKeysByUsers[currentAlias] === "undefined") {
    let carbonCopyUsers
    let blindCarbonCopyUsers

    if (conversation?.cc.length > 3) {
      carbonCopyUsers = JSON.parse(conversation?.cc)
    }
    
    if (conversation?.bcc.length > 3) {
      blindCarbonCopyUsers = JSON.parse(conversation?.bcc)
    }
    
    if (keysObject.encryptedKeysCarbonCopy[currentAlias]) {
      for (let i = 0; i < carbonCopyUsers.length; i++) {
        if (carbonCopyUsers[i] === currentAlias) {
          return decryptFunction(getUser, keysObject.encryptedKeysCarbonCopy[currentAlias], conversation)
        }
      }
    } else if (keysObject.encryptedKeysBlindCarbonCopy[currentAlias]) {
      for (let i = 0; i < blindCarbonCopyUsers.length; i++) {
        if (blindCarbonCopyUsers[i] === currentAlias) {
          return decryptFunction(getUser, keysObject.encryptedKeysBlindCarbonCopy[currentAlias], conversation)
        }
      }
    }
  } else {
    return decryptFunction(getUser, keysObject.encryptedKeysByUsers[currentAlias], conversation)
  }
}

async function decryptFunction(getUser, key, conversation) {
  const myPair = await getUser()._.sea;
  const decryptedKey = await SEA.decrypt(
    key,
    await SEA.secret(conversation?.senderEpub, myPair)
  );

  const decryptedSubject = await SEA.decrypt(
    conversation?.subject,
    decryptedKey
  );

  const decryptedBody = await SEA.decrypt(
    conversation?.recentBody,
    decryptedKey
  );

  console.log(conversation)

  return {
    sender: conversation?.sender,
    senderEpub: conversation?.senderEpub,
    keys: conversation?.keys,
    subject: decryptedSubject,
    body: decryptedBody,
  };
}

export async function decryptionMessage(
  refMessage,
  getGun,
  getUser,
  alias,
  keys,
  senderEpub
) {
  console.log(refMessage)
  const message = await getMessageByReference(refMessage, getGun);
  const keysObject = JSON.parse(keys)
  console.log(keysObject)
  return decryptMessage(getUser, message, keysObject.encryptedKeysByUsers[alias], senderEpub)
}

async function decryptMessage(getUser, message, key, senderEpub) {
  const myPair = await getUser()._.sea;
  const decryptedKey = await SEA.decrypt(
    key,
    await SEA.secret(senderEpub, myPair)
  );

  console.log(decryptedKey)

  const decryptedBody = await SEA.decrypt(
    message?.body,
    decryptedKey
  );

  return {
    timestamp: message.timestamp,
    sender: message.sender,
    body: decryptedBody,
  };
}

async function getMessageByReference(path, getGun) {
  let result;
  console.log(path)
  await getGun()
    .path(path)
    .once((obj) => {
      result = obj;
    });
  console.log(result)
  return result;
}

async function getByReference(path, getGun) {
  let result;
  await getGun()
    .path(path)
    .once((obj) => {
      result = obj;
    });
  console.log(result)
  return result;
}