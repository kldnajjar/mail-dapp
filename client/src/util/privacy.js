import gun from "gun/gun";
import "gun/sea";
import SEA from "gun/sea";
import "gun/lib/path.js";
// import regeneratorRuntime from "regenerator-runtime";

// ENCRYPTION
export async function encryption(email, getGun, getUser) {
  // TODO
  const encryptionKey = process.env.APP_MAIL_ENCRYPTION_KEY; // <-- This key is just an example. Ideally I think we should generate it every time sender sends an email.
  const encryptedSubject = await SEA.encrypt(email.subject, encryptionKey);
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
  if (email?.cc) {
    await getRecipientKeys(encryptedKeysCarbonCopy, email.cc, getGun, encryptionKey, senderPair);
  }
  if (email?.bcc) {
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
      .map()
      .once((user) => {
        console.log(user)
        epubObj[`${emails[j]}`] = user.epub;
      });
    getGun().get(`~@${emails[i]}`).off();
  }
  return epubObj;
}

// DECRYPTION
export async function decryption(
  conversation,
  getGun,
  getUser,
  currentAlias
) {
  const keysObjectJson = JSON.parse(conversation?.keys);
  const keysObject = Object.assign({}, ...function _flatten(o) { return [].concat(...Object.keys(o).map(k => typeof o[k] === 'object' ? _flatten(o[k]) : ({[k]: o[k]})))}(keysObjectJson))
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
    id : `conversations/${conversation?.id}`,
    keys : keysObject , 
  };

  // if (typeof keysObject.encryptedKeysByUsers[currentAlias] === "undefined") {
  //   let carbonCopyUsers
  //   let blindCarbonCopyUsers

  //   if (conversation?.cc.length > 3) {
  //     carbonCopyUsers = JSON.parse(conversation?.cc)
  //   }
    
  //   if (conversation?.bcc.length > 3) {
  //     blindCarbonCopyUsers = JSON.parse(conversation?.bcc)
  //   }
    
  //   if (keysObject.encryptedKeysCarbonCopy[currentAlias]) {
  //     for (let i = 0; i < carbonCopyUsers.length; i++) {
  //       if (carbonCopyUsers[i] === currentAlias) {
  //         return decryptFunction(getUser, keysObject.encryptedKeysCarbonCopy[currentAlias], conversation)
  //       }
  //     }
  //   } else if (keysObject.encryptedKeysBlindCarbonCopy[currentAlias]) {
  //     for (let i = 0; i < blindCarbonCopyUsers.length; i++) {
  //       if (blindCarbonCopyUsers[i] === currentAlias) {
  //         return decryptFunction(getUser, keysObject.encryptedKeysBlindCarbonCopy[currentAlias], conversation)
  //       }
  //     }
  //   }
  // } else {
  //   return decryptFunction(getUser, keysObject.encryptedKeysByUsers[currentAlias], conversation)
  // }
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


  return {
    sender: conversation?.sender,
    senderEpub: conversation?.senderEpub,
    keys: conversation?.keys,
    subject: decryptedSubject,
    body: decryptedBody,
  };
}

export async function decryptionMessage(
  message,
  getGun,
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
    sender : message?.sender,
  };
  // const keysObject = JSON.parse(keys)
  // console.log(keysObject)
  // return decryptMessage(getUser, message, keysObject.encryptedKeysByUsers[alias], senderEpub)
}

async function decryptMessage(getUser, message, key, senderEpub) {
  const myPair = await getUser()._.sea;
  const decryptedKey = await SEA.decrypt(
    key,
    await SEA.secret(senderEpub, myPair)
  );
  const decryptedBody = await SEA.decrypt(
    message?.body,
    decryptedKey
  );
  console.log(message.timestamp)

  return {
    timestamp: message.timestamp,
    sender: message.sender,
    body: decryptedBody,
  };
}

async function getMessageByReference(path, getGun) {
  let result;
  await getGun()
    .path(path)
    .once((obj) => {
      result = obj;
    });
  return result;
}

async function getByReference(path, getGun) {
  
  let result;
  
  await getGun()
    .path(path)
    .once((obj) => {
      result = obj;
    });
  
  return result;
}