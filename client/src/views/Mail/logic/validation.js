import { toast } from "react-toastify";

const isValidEmail = (emailsObj) => {
  const { allEmails } = emailsObj;
  let isValid = true;

  allEmails.forEach((email) => {
    if (!isEmail(email)) {
      toast.error(`Invalid email ${email}`);
      isValid = false;
    } else if (!isMyKloudEmail(email)) {
      toast.error(`not myKloud email ${email}`);
      isValid = false;
    }
  });

  return isValid;
};

const isEmail = (email) => {
  const obj = String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  if (obj === null) {
    return false;
  }
  return true;
};

const isMyKloudEmail = (email) => {
  if (email.indexOf("mykloud.io") === -1) {
    return false;
  }
  return true;
};

export { isValidEmail };
