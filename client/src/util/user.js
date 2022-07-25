const getGunCurrentUserAlias = async (getUser) => {
  let name;
  await getUser()
    .get("alias")
    .once((alias) => {
      name = alias;
    });
  return name;
};

const getGunCurrentUserFirstAndLastNames = async (getUser) => {
  let names = {}
  const email = await getGunCurrentUserAlias(getUser)
  await getGun()
    .get("accounts")
    .get(email)
    .once((data) => {
      names.firstName = data.firstName;
      names.lastName = data.lastName;
    });
  return names;
};

const getCurrentUserAlias = async (user, getUser) => {
  let alias = user?.email;
  if (!alias) {
    alias = await getGunCurrentUserAlias(getUser);
  }
  return alias;
};

const getCurrentUserFirstAndLastNames = async (user, getUser) => {
  let names = {
    firstName: user?.firstName,
    lastName: user?.lastName
  }
  if (!names) {
    names = await getGunCurrentUserFirstAndLastNames(getUser);
  }
  return names;
};

const getCurrentUser = (user) => {
  let current_user = user;
  if (!current_user) {
    current_user = JSON.parse(sessionStorage.getItem("account"));
  }
  return current_user;
};

export { getCurrentUserAlias, getCurrentUser, getCurrentUserFirstAndLastNames };
