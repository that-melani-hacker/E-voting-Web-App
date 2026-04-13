import { createContext, useContext, useState } from "react";
import { clearStoredAuth, getStoredAuth, setStoredAuth } from "../../utils/storage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(getStoredAuth());

  const login = (payload) => {
    setAuth(payload);
    setStoredAuth(payload);
  };

  const logout = () => {
    setAuth(null);
    clearStoredAuth();
  };

  return <AuthContext.Provider value={{ auth, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

