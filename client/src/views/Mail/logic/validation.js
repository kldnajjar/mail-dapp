import { toast } from "react-toastify";

const isValidEmails =  async (emailsObj , getGun) => {
  const { allEmails } = emailsObj;
  for( let i = 0; i < allEmails.length; i++){
    if (!isEmail(allEmails[i])) {
      toast.error(`Invalid email ${allEmails[i]}`);
      return false;
    }
    const valid = await isMyKloudEmail(allEmails[i] , getGun);
    if (!valid) {
      toast.error(`not myKloud email ${allEmails[i]}`);
      return false;
    }
  }
  return true;
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

const isMyKloudEmail = async (email , getGun) => {
  if (email.indexOf("mykloud.io") === -1) {
    return false;
  }else{
    let isExist = null;
    await getGun()
    .get(`~@${email}`)
    .once((data) => {
      isExist = data
    })
    return isExist ? true : false;
  }
};
export { isValidEmails };
