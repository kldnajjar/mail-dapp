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

export { getCurrentUserAlias };
