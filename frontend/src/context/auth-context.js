import React from "react";

export default React.createContext({
  token: null,
  userId: null,
  isAdmin: null,
  login: (token, userId, tokenExpiration, isAdmin) => {},
  logout: () => {},
});
