const getGunCurrentUserAlias = async (getUser) => {
  let name;
  await getUser()
    .get("alias")
    .once((alias) => {
      name = alias;
    });
  return name;
};

const getCurrentUserAlias = async (user, getUser) => {
  let alias = user?.email;
  if (!alias) {
    alias = await getGunCurrentUserAlias(getUser);
  }
  return alias;
};

const getCurrentUser = (user) => {
  let current_user = user;
  if (!current_user) {
    current_user = JSON.parse(sessionStorage.getItem("account"));
  }
  return current_user;
};

export { getCurrentUserAlias, getCurrentUser };
