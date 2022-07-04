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

  const senderEpub = await getUser()._.sea.epub;
  const senderPair = await getUser()._.sea;

  const encryptedEncryptionKeySender = await SEA.encrypt(
    encryptionKey,
    await SEA.secret(senderEpub, senderPair)
  );
  const encryptedKeysByUsers = {
  }
  encryptedKeysByUsers[email["sender"]] = encryptedEncryptionKeySender;
  const recipientEpubObj = await getRecipientEpub(email.recipients , getGun)
  for (const key in recipientEpubObj) {
    const encryptedEncryptionKeyRecipient = await SEA.encrypt(
          encryptionKey,
          await SEA.secret(recipientEpubObj[key], senderPair)  
    );
    encryptedKeysByUsers[key] = encryptedEncryptionKeyRecipient;
  }
  console.log(encryptedKeysByUsers)

  return {
    encryptedSubject : encryptedSubject,
    encryptedMessage : encryptedMessage , 
    encryptedKeysByUsers : encryptedKeysByUsers,
  }


  // const encryptionKey = "mykloud-key"; // <-- This key is just an example. Ideally I think we should generate it every time sender sends an email.
  // const encryptedSubject = await SEA.encrypt(email.subject, encryptionKey);
  // const encryptedMessage = await SEA.encrypt(email.body, encryptionKey);

  // if (!email.recipient.includes(";")) {
  //   const recipientEpub = await getRecipientEpub(email.recipient, getGun);
  //   const currentUserEpub = getUser()._.sea.epub;
  //   const myPair = getUser()._.sea;
  
  //   const encryptedEncryptionKeyRecipient = await encryptTheKey(recipientEpub, myPair, encryptionKey)
  //   const encryptedEncryptionKeySender = await encryptTheKey(currentUserEpub, myPair, encryptionKey)
  
  //   const keys = {
  //     recipientKey: encryptedEncryptionKeyRecipient,
  //     senderKey: encryptedEncryptionKeySender
  //   };

  //   const recipients = {
  //     recipient: email.recipient
  //   }
  
  //   email.subject = encryptedSubject;
  //   email.body = encryptedMessage;
  //   email.keys = keys
  //   email.recipients = recipients
  //   email.isEncrypted = true;
  //   email.isSender = false;
  
  //   return email;
  // } else {
  //   const myPair = getUser()._.sea
  //   const recipientArray = email.recipient.split(";")
  //   const keys = {}
  //   const promises = recipientArray.map(async (recipient) => await getKeyForRecipient(recipient, getGun, myPair, encryptionKey));

  //   Promise.all(promises).then((resultKeys) => {
  //     console.log(resultKeys)

  //     for (let i = 0; i < recipientArray.length; i++) {
  //       keys[recipientArray[i]] = resultKeys[i]
  //     }
      
  //     email.subject = encryptedSubject;
  //     email.body = encryptedMessage;
  //     email.keys = keys
  //     email.isEncrypted = true;
  //     email.isSender = false;
    
  //     return email;
  //   })
  // }
}


async function getRecipientEpub(email, getGun) {
  console.log(email)
  const epubObj = {}
  for( let i = 0 ; i < email.length ; i++){
    let j = i ;
   await getGun()
    .get(`~@${email[i]}`)
    .map()
    .once((user) => {
      epubObj[`${email[j]}`] = user.epub;
    });
    getGun().get(`~@${email[i]}`).off();
  }
  return epubObj ; 
}

// async function getKeyForRecipient(recipient, getGun, myPair, encryptionKey) {
//   const recipientEpub = await getRecipientEpub(recipient, getGun)
//   const encryptedKey = await encryptTheKey(recipientEpub, myPair, encryptionKey)
//   return encryptedKey
// }

async function encryptTheKey(epub, myPair, encryptionKey) {
  const encryptedEncryptionKey = await SEA.encrypt(
    encryptionKey,
    await SEA.secret(epub, myPair)
  );
  return encryptedEncryptionKey
}

// async function getRecipientEpub(recipient, getGun) {
//   let recipientEpub;
//   await getGun()
//     .get(`~@${recipient}`)
//     .map()
//     .once((user) => {
//       recipientEpub = user.epub;
//     });
//   return recipientEpub;
// }

// DECRYPTION
export async function decryption(refMail, getGun, getUser, getMails, currentAlias) {
  let email;
  await getGun()
    .path(refMail)
    .once((mail) => {
      email = mail;
    });

    prepare

    const refArray = refMail.split("/")
    refArray.pop()
    refConversation = refArray.toString()
    refConversation.replaceAll(",", "/")

    let subject;
    await getGun()
      .path()
      .once((data) => {
        subject = data;
      });

  console.log(email)

  if (email.isEncrypted) {
    // if (currentUserEmail === email.sender) {
    //   email.isSender = true;
    // }
    const decryptedEmail = await decryptNew(
      email,
      getGun,
      getUser,
      getMails,
      refMail,
      currentAlias
    );
    return decryptedEmail;
  } else {
    return email;
  }

  // if (
  //   currentUserEmail === email.recipient ||
  //   currentUserEmail === email.sender
  // ) {
    // if (email.isEncrypted) {
    //   if (currentUserEmail === email.sender) {
    //     email.isSender = true;
    //   }
    //   const decryptedEmail = await decrypt(
    //     email,
    //     getGun,
    //     getUser,
    //     getMails,
    //     refMail,
    //     currentUserEmail
    //   );
    //   return decryptedEmail;
    // } else {
    //   return email;
    // }
  // } else {
  //   return null;
  // }
}

async function decryptNew(email, getGun, getUser, refMail, currentAlias) {
  const senderEpubPromise = new Promise(async (resolve, reject) => {
    let senderEpub = await getSenderEpub(email, getGun);
    resolve(senderEpub);
  });

  const myPair = getUser()._.sea;

  return senderEpubPromise.then((senderEpub) => {
    return decryptedKeyPromiseFun(senderEpub, myPair, getGun, refMail, currentAlias).then((key) => {
      return decryptEmailPromiseFun(key, email).then((result) => {
        return result;
      });
    });
  });
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

async function decryptedKeyPromiseFun(senderEpub, myPair, getGun, refMail, currentAlias) {
  return new Promise(async (resolve, reject) => {

    let myKey;
    await getGun()
      .path(refMail + "/keys")
      .once((keys) => {
        myKey = keys[currentAlias]
      });

      const secret = await SEA.secret(senderEpub, myPair);
      const decryptedEncryptionKey = await SEA.decrypt(myKey, secret);

      resolve(decryptedEncryptionKey);
  });
}

// async function decryptedKeyPromiseFun(senderEpub, myPair, email, getGun, refMail, currentUserEmail) {
//   return new Promise(async (resolve, reject) => {
//     let senderKey;
//     let recipientKey;
//     await getGun()
//       .path(refMail + "/keys")
//       .once((keys) => {
//         recipientKey = keys.recipientKey,
//         senderKey = keys.senderKey
//       });

//     console.log(`senderKey: ${senderKey}`)
//     console.log(`recipientKey: ${recipientKey}`)

//     if (email.isSender) {
//       console.log(`senderEpub: ${senderEpub}`)
//       const secret = await SEA.secret(senderEpub, myPair);
//       const decryptedEncryptionKey = await SEA.decrypt(senderKey, secret);

//       resolve(decryptedEncryptionKey);
//     } else {
//       const secret = await SEA.secret(senderEpub, myPair);
//       const decryptedEncryptionKey = await SEA.decrypt(recipientKey, secret);

//       resolve(decryptedEncryptionKey);
//     }
//   });
// }

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