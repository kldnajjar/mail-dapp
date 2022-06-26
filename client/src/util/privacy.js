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
  const myPair = getUser()._.sea; // "getUser()" is the current user

  console.log(`recipientEpub: ${recipientEpub}`)

  const encryptedEncryptionKey = await SEA.encrypt(
    encryptionKey,
    await SEA.secret(recipientEpub, myPair)
  );

  // if (email.cc != null) {
  //   const CCRecipientsArray = await getCCRecipients(
  //     email,
  //     encryptionKey,
  //     myPair,
  //     getGun
  //   );
  //   email.keys = CCRecipientsArray;
  // }

  email.key = encryptedEncryptionKey
  email.subject = encryptedSubject;
  email.body = encryptedMessage;
  email.isEncrypted = true
  console.log(email)
  return email;
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

async function getCCRecipients(email, encryptionKey, myPair, getGun) {
  let CCRecipientsArray = [];
  let i = 0;

  await getGun()
    .get("profiles")
    .map()
    .once(async (user) => {
      if (user.email === email.cc[i]) {
        const recipient = {
          email: user.email,
          key: await SEA.encrypt(
            encryptionKey,
            await SEA.secret(user.epub, myPair)
          ),
        };
        CCRecipientsArray.push(recipient);
      }
      i++;
    });

  // await users.map().once(async user => {
  //   if (user.email === email.cc[i]) {
  //     const recipient = {
  //       email: user.email,
  //       key: await SEA.encrypt(encryptionKey, await SEA.secret(user.epub, myPair))
  //     }
  //     CCRecipientsArray.push(recipient)
  //   }
  //   i++
  // })

  return CCRecipientsArray;
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

  // email.cc.forEach((element, index) => {
  //   if (currentUserEmail === element.recipient) {
  //     isCarbonCopy = true;
  //     position = index;
  //   }
  // });

  if (
    currentUserEmail === email.recipient ||
    currentUserEmail === email.sender
  ) {
    console.log("before if isEncrypted")
    if (email.isEncrypted) {
      console.log("Encrypted")
      // const decryptedEmail = await decryptForOne(email, getGun, getUser);
      const decryptedEmail = await decrypt(email.key, email, getGun, getUser, currentUserEmail);
      console.log(decryptedEmail)
      return decryptedEmail
    } else {
      console.log("Not encrypted")
      return email
    }
  } else if (isCarbonCopy) {
    const key = email.keys[position].key; // get the needed key from email.keys array
    return await decrypt(key, email, getGun, getUser, currentUserEmail);
  } else {
    return email;
  }
}

async function decrypt(key, email, getGun, getUser, currentUserEmail) {
  const senderEpub = await recipientOrSender(email, getGun, currentUserEmail)
  const myPair = getUser()._.sea; // "getUser()" is the current user

  console.log(`senderEpub: ${senderEpub}`)

  const decryptedKeyPromise = new Promise(async (resolve, reject) => {
    const secret = await SEA.secret(senderEpub, myPair)
    const decryptedEncryptionKey = await SEA.decrypt(
      key, secret
    );

    console.log(decryptedEncryptionKey)
    resolve(decryptedEncryptionKey)
  })

  // return decryptEmailPromiseFun(key, email).then(result => {
  //   return result
  // })

  return decryptedKeyPromise.then(key => {
    console.log(key)
    return decryptEmailPromiseFun(key, email).then(result => {
      console.log(result)
      return result
    })
  })

  // Decryption promise
  // const decryptedEmailPromise = new Promise(async (resolve, reject) => {
  //   const decryptedSubject = await SEA.decrypt(email.subject, decryptedEncryptionKey);
  //   const decryptedMessage = await SEA.decrypt(email.body, decryptedEncryptionKey);

  //   email.subject = decryptedSubject;
  //   email.body = decryptedMessage;
  //   email.isEncrypted = false
  //   console.log(email);
  //   resolve(email)
  // })

  // const decryptedSubject = await SEA.decrypt(email.subject, decryptedEncryptionKey);
  // const decryptedMessage = await SEA.decrypt(email.body, decryptedEncryptionKey);

  // email.subject = decryptedSubject;
  // email.body = decryptedMessage;
  // email.isEncrypted = false
  // return email;
}

async function recipientOrSender(email, getGun, currentUserEmail) {
  if (currentUserEmail === email.recipient) {
    console.log("If statement in recipient")
    const senderEpub = await getSenderEpub(email, getGun);
    return senderEpub
  } else {
    console.log("If statement in sender")
    const senderEpub = await getCurrentUserEpub(getGun)
    return senderEpub
  }
}

async function getCurrentUserEpub(getGun) {
  let senderEpub;
  await getGun()
    .get("epub")
    .once((epub) => {
      senderEpub = epub;
    });
  return senderEpub;
}

async function decryptEmailPromiseFun(key, email) {
  return new Promise(async (resolve, reject) => {
    const decryptedSubject = await SEA.decrypt(email.subject, key);
    const decryptedMessage = await SEA.decrypt(email.body, key);

    email.subject = decryptedSubject;
    email.body = decryptedMessage;
    email.isEncrypted = false
    console.log(email);
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