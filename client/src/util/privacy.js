import gun from "gun/gun";
import "gun/sea";
import SEA from "gun/sea";
// import regeneratorRuntime from "regenerator-runtime";

// ENCRYPTION
export async function encryption(email, getGun, getUser) {
  const encryptionKey = "mykloud-key"; // <-- This key is just an example. Ideally I think we should generate it every time sender sends an email.
  const encryptedSubject = await SEA.encrypt(email.subject, encryptionKey);
  const encryptedMessage = await SEA.encrypt(email.body, encryptionKey);

  const recipientEpub = await getRecipientEpub(email, getGun);
  const currentUserEpub = getUser()._.sea.epub
  const myPair = getUser()._.sea;

  const encryptedEncryptionKeyRecipient = await SEA.encrypt(
    encryptionKey,
    await SEA.secret(recipientEpub, myPair)
  );

  const encryptedEncryptionKeySender = await SEA.encrypt(
    encryptionKey,
    await SEA.secret(currentUserEpub, myPair)
  );

  const keys = {
    recipientKey: encryptedEncryptionKeyRecipient,
  }

  email.recipientKey = encryptedEncryptionKeyRecipient
  email.senderKey = encryptedEncryptionKeySender
  email.subject = encryptedSubject;
  email.body = encryptedMessage;
  email.isEncrypted = true
  email.isSender = false

  const ObjectToSend = {
    email: email,
    keys: keys
  }

  return ObjectToSend;
}

async function getRecipientEpub(email, getGun) {
  let recipientEpub;
  await getGun()
    .get(`~@${email.recipient}`)
    .map()
    .once((user) => {
      recipientEpub = user.epub;
    });
  return recipientEpub;
}

// DECRYPTION
export async function decryption(refMail, getGun, getUser, getMails) {
  const currentUserEmail = await getCurrentUserEmail(getUser);

  let isCarbonCopy = false;
  let position = 0;

  let email;
  await getMails()
    .get(refMail)
    .once((mail) => {
      email = mail;
    });

  if (
    currentUserEmail === email.recipient ||
    currentUserEmail === email.sender
  ) {
    if (email.isEncrypted) {
      if (currentUserEmail === email.sender) {
        email.isSender = true
      }
      const decryptedEmail = await decrypt(email, getGun, getUser, getMails, refMail);
      return decryptedEmail
    } else {
      return email
    }
  } else if (isCarbonCopy) {
    const key = email.keys[position].key;
    return await decrypt(email, getGun, getUser, currentUserEmail);
  } else {
    return email;
  }
}

async function decrypt(email, getGun, getUser, getMails, refMail) {
  const senderEpubPromise = new Promise(async (resolve, reject) => {
    let senderEpub = await getSenderEpub(email, getGun)
    resolve(senderEpub)
  })
  
  const myPair = getUser()._.sea;

  return senderEpubPromise.then(senderEpub => {
    return decryptedKeyPromiseFun(senderEpub, myPair, email, getMails, refMail).then(key => {
      return decryptEmailPromiseFun(key, email).then(result => {
        return result
      })
    })
  })
}

async function decryptedKeyPromiseFun(senderEpub, myPair, email, getMails, refMail) {
  return new Promise(async (resolve, reject) => {
    let senderKey;
    let recipientKey;
    await getMails()
      .get(refMail)
      .get("keys")
      .once((keys) => {
        recipientKey = keys.recipientKey,
        senderKey = keys.senderKey
      });

    if (email.isSender) {
      const secret = await SEA.secret(senderEpub, myPair)
      const decryptedEncryptionKey = await SEA.decrypt(senderKey, secret);
  
      resolve(decryptedEncryptionKey)
    } else {
      const secret = await SEA.secret(senderEpub, myPair)
      const decryptedEncryptionKey = await SEA.decrypt(recipientKey, secret);
  
      resolve(decryptedEncryptionKey)
    }
  })
}

async function decryptEmailPromiseFun(key, email) {
  return new Promise(async (resolve, reject) => {
    const decryptedSubject = await SEA.decrypt(email.subject, key);
    const decryptedMessage = await SEA.decrypt(email.body, key);

    email.subject = decryptedSubject;
    email.body = decryptedMessage;
    email.isEncrypted = false
    resolve(email)
  })
}

async function getSenderEpub(email, getGun) {
  let senderEpub;
  await getGun()
    .get(`~@${email.sender}`)
    .map()
    .once((user) => {
      senderEpub = user.epub;
    });
  return senderEpub;
}

async function getCurrentUserEmail(getUser) {
  let currentAlias;
  await getUser()
    .get("alias")
    .once((user) => {
      currentAlias = user;
    });
  return currentAlias;
}

// export async function encryptForOne(email, getGun, getUser) {
//   const recipientEpub = await getRecipientEpub(email, getGun);
//   const myPair = getUser()._.sea;

//   const secret = await SEA.secret(recipientEpub, myPair);

//   const encryptedSubject = await SEA.encrypt(email.subject, secret);
//   const encryptedMessage = await SEA.encrypt(email.body, secret);

//   email.subject = encryptedSubject;
//   email.body = encryptedMessage;
//   email.isEncrypted = true
//   console.log(email)
//   return email;
// }

// async function decryptForOne(email, getGun, getUser) {
//   const senderEpub = await getSenderEpub(email, getGun);
//   const myPair = getUser()._.sea;

//   const decryptedEmailPromise = new Promise(async (resolve, reject) => {
//     const secret = await SEA.secret(senderEpub, myPair)
//     const decryptedSubject = await SEA.decrypt(email.subject, secret);
//     const decryptedMessage = await SEA.decrypt(email.body, secret);

//     email.subject = decryptedSubject;
//     email.body = decryptedMessage;
//     email.isEncrypted = false
//     console.log(email);
//     resolve(email)
//   })

//   return decryptedEmailPromise.then(value => {
//     return value
//   })
// }