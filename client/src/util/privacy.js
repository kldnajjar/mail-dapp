import gun from "gun/gun";
import "gun/sea";
import SEA from "gun/sea";
import "gun/lib/path.js";
// import regeneratorRuntime from "regenerator-runtime";

// ENCRYPTION
export async function encryption(email, getGun, getUser) {
  const encryptionKey = "mykloud-key"; // <-- This key is just an example. Ideally I think we should generate it every time sender sends an email.
  const encryptedSubject = await SEA.encrypt(email.subject, encryptionKey);
  const encryptedMessage = await SEA.encrypt(email.body, encryptionKey);

  const senderEpub = await getUser()._.sea.epub;
  const senderPair = await getUser()._.sea;

  const encryptedEncryptionKeySender = await SEA.encrypt(
    encryptionKey,
    await SEA.secret(senderEpub, senderPair)
  );
  const encryptedKeysByUsers = {};
  encryptedKeysByUsers[email["sender"]] = encryptedEncryptionKeySender;
  const recipientEpubObj = await getRecipientEpub(email.recipients, getGun);
  for (const key in recipientEpubObj) {
    const encryptedEncryptionKeyRecipient = await SEA.encrypt(
      encryptionKey,
      await SEA.secret(recipientEpubObj[key], senderPair)
    );
    encryptedKeysByUsers[key] = encryptedEncryptionKeyRecipient;
  }

  return {
    encryptedSubject,
    encryptedMessage,
    encryptedKeysByUsers,
    senderEpub,
  };
}

async function getRecipientEpub(email, getGun) {
  const epubObj = {};
  for (let i = 0; i < email.length; i++) {
    let j = i;
    await getGun()
      .get(`~@${email[i]}`)
      .map()
      .once((user) => {
        epubObj[`${email[j]}`] = user.epub;
      });
    getGun().get(`~@${email[i]}`).off();
  }
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
  };
}

async function getByReference(path, getGun) {
  console.log(path)
  let result;
  await getGun()
    .path(path)
    .once((obj) => {
      result = obj;
    });
  console.log(result)
  return result;
}