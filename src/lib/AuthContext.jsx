import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user] = useState({ name: "Desenvolvedor MVP" });
  return (
    <AuthContext.Provider value={{ user, isLoadingAuth: false, isLoadingPublicSettings: false, authError: null }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
