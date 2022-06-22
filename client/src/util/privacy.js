import "gun/sea";
// import regeneratorRuntime from "regenerator-runtime";

// ENCRYPTION
export async function encryption(email, getGun, getUser) {
  const encryptionKey = "myk-key"; // <-- This key is just an example. Ideally I think we should generate it every time sender sends an email.
  const encryptedSubject = await SEA.encrypt(email.subject, encryptionKey);
  const encryptedMessage = await SEA.encrypt(email.body, encryptionKey);

  const recipientEpub =
    "SSxxqChjYYwjY94nZVdQLWuWLLWQtkdkaDhzpRer3o8.IsYqurZOk2Qz9Z8Ka8pYsucV9_8EWqRG78_GzCJeITU";
  // const recipientEpub = await getRecipientEpub(email, getGun)
  const myPair = getUser()._.sea; // "getUser()" is the current user

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

  email.key = encryptionKey;
  email.subject = encryptedSubject;
  email.body = encryptedMessage;
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
  console.log("4", email);
  if (currentUserEmail === email.recipient) {
    return await decrypt(email.key, email, getGun, getUser);
  } else if (isCarbonCopy) {
    const key = email.keys[position].key; // get the need key from email.keys array
    return await decrypt(key, email, getGun, getUser);
  } else {
    return;
  }
}

async function decrypt(key, email, getGun, getUser) {
  const senderEpub =
    "6b9wNr4Kvhe6o98VS4WdXBnQZNuJVx5CuBtfBQ5tYho.grwkZkCxiRUW4yT9hdgwEK2y8VVhhhczUzxuTr0xGsw";
  // const senderEpub = await getSenderEpub(email, getGun)
  const myPair = getUser()._.sea; // "getUser()" is the current user

  const decryptedEncryptionKey = await SEA.decrypt(
    key,
    await SEA.secret(senderEpub, myPair)
  );

  const decryptedSubject = await SEA.decrypt(email.subject, key);
  const decryptedMessage = await SEA.decrypt(email.body, key);

  email.subject = decryptedSubject;
  email.body = decryptedMessage;
  return email;
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
