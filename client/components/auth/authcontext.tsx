"use client";
import { createContext, useState, useEffect, Dispatch , SetStateAction } from "react";
interface AuthContextType {
  token: string;
  setToken: Dispatch<SetStateAction<string>>;
}

export const AuthContext = createContext<AuthContextType>({
  token: "",            // default token
  setToken: () => {},   // default function, does nothing
});

export default function AuthProvider({ children }:{children:any}) {
  const [token, setToken] = useState("");

  // Load token from localStorage on app start
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}
