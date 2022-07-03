import gun from "gun/gun";
import "gun/sea";
import SEA from "gun/sea";
import "gun/lib/path.js"
// import regeneratorRuntime from "regenerator-runtime";

// ENCRYPTION
export async function encryption(email, getGun, getUser) {
  const encryptionKey = "mykloud-key"; // <-- This key is just an example. Ideally I think we should generate it every time sender sends an email.
  const encryptedSubject = await SEA.encrypt(email.subject, encryptionKey);
  const encryptedMessage = await SEA.encrypt(email.body, encryptionKey);

  if (!email.recipient.includes(";")) {
    const recipientEpub = await getRecipientEpub(email.recipient, getGun);
    const currentUserEpub = getUser()._.sea.epub;
    const myPair = getUser()._.sea;
  
    const encryptedEncryptionKeyRecipient = await encryptTheKey(recipientEpub, myPair, encryptionKey)
    const encryptedEncryptionKeySender = await encryptTheKey(currentUserEpub, myPair, encryptionKey)
  
    const keys = {
      recipientKey: encryptedEncryptionKeyRecipient,
      senderKey: encryptedEncryptionKeySender
    };

    const recipients = {
      recipient: email.recipient
    }
  
    email.subject = encryptedSubject;
    email.body = encryptedMessage;
    email.keys = keys
    email.recipient = recipients
    email.isEncrypted = true;
    email.isSender = false;
  
    return email;
  } else {
    const myPair = getUser()._.sea
    const recipientArray = email.recipient.split(";")
    const keys = {}
    const recipients = {}
    const promises = recipientArray.map(async (recipient) => await getKeyForRecipient(recipient, getGun, myPair, encryptionKey));

    Promise.all(promises).then((resultKeys) => {
      console.log(resultKeys)

      for (let i = 0; i < recipientArray.length; i++) {
        keys[recipientArray[i]] = resultKeys[i]
        recipients[recipientArray[i]] = recipientArray[i]
      }

      console.log(keys)
      email.subject = encryptedSubject;
      email.body = encryptedMessage;
      email.keys = keys
      email.recipients
      email.isEncrypted = true;
      email.isSender = false;
    
      return email;
    })
  }
}

async function getKeyForRecipient(recipient, getGun, myPair, encryptionKey) {
  const recipientEpub = await getRecipientEpub(recipient, getGun)
  const encryptedKey = await encryptTheKey(recipientEpub, myPair, encryptionKey)
  return encryptedKey
}

async function encryptTheKey(epub, myPair, encryptionKey) {
  const encryptedEncryptionKey = await SEA.encrypt(
    encryptionKey,
    await SEA.secret(epub, myPair)
  );
  return encryptedEncryptionKey
}

async function getRecipientEpub(recipient, getGun) {
  let recipientEpub;
  await getGun()
    .get(`~@${recipient}`)
    .map()
    .once((user) => {
      recipientEpub = user.epub;
    });
  return recipientEpub;
}

// DECRYPTION
export async function decryption(refMail, getGun, getUser, getMails, currentAlias) {
  // const currentUserEmail = await getCurrentUserEmail(getUser);
  const currentUserEmail = currentAlias

  let isCarbonCopy = false;
  let position = 0;

  let email;
  await getGun()
    .path(refMail)
    .once((mail) => {
      email = mail;
    });

    console.log(email)

  if (
    currentUserEmail === email.recipient ||
    currentUserEmail === email.sender
  ) {
    if (email.isEncrypted) {
      if (currentUserEmail === email.sender) {
        email.isSender = true;
      }
      const decryptedEmail = await decrypt(
        email,
        getGun,
        getUser,
        getMails,
        refMail,
        currentUserEmail
      );
      return decryptedEmail;
    } else {
      return email;
    }
  } else {
    return null;
  }
}

async function decrypt(email, getGun, getUser, getMails, refMail, currentUserEmail) {
  const senderEpubPromise = new Promise(async (resolve, reject) => {
    let senderEpub = await getSenderEpub(email, getGun);
    resolve(senderEpub);
  });

  const myPair = getUser()._.sea;

  return senderEpubPromise.then((senderEpub) => {
    return decryptedKeyPromiseFun(senderEpub, myPair, email, getGun, refMail, currentUserEmail).then((key) => {
      return decryptEmailPromiseFun(key, email).then((result) => {
        return result;
      });
    });
  });
}

async function decryptedKeyPromiseFun(senderEpub, myPair, email, getGun, refMail, currentUserEmail) {
  return new Promise(async (resolve, reject) => {
    let senderKey;
    let recipientKey;
    await getGun()
      .path(refMail + "/keys")
      .once((keys) => {
        recipientKey = keys.recipientKey,
        senderKey = keys.senderKey
      });

    console.log(`senderKey: ${senderKey}`)
    console.log(`recipientKey: ${recipientKey}`)

    if (email.isSender) {
      console.log(`senderEpub: ${senderEpub}`)
      const secret = await SEA.secret(senderEpub, myPair);
      const decryptedEncryptionKey = await SEA.decrypt(senderKey, secret);

      resolve(decryptedEncryptionKey);
    } else {
      const secret = await SEA.secret(senderEpub, myPair);
      const decryptedEncryptionKey = await SEA.decrypt(recipientKey, secret);

      resolve(decryptedEncryptionKey);
    }
  });
}

async function decryptEmailPromiseFun(key, email) {
  return new Promise(async (resolve, reject) => {
    const decryptedSubject = await SEA.decrypt(email.subject, key);
    const decryptedMessage = await SEA.decrypt(email.body, key);

    email.subject = decryptedSubject;
    email.body = decryptedMessage;
    email.isEncrypted = false;
    resolve(email);
  });
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
//   const recipientEpub = await getRecipientEpub(email.recipient, getGun);
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
