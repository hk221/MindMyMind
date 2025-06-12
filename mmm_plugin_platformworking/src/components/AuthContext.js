import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

// This file defines an authentication context for managing user state in a React application using Firebase.
// It provides a context that can be used to access the current user and loading state throughout the app.
// It exports an AuthProvider component that wraps the application and a useAuth hook for accessing the context.
// It also handles loading state to ensure that the user data is available before rendering components that depend on it.
const AuthContext = createContext({ user: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // This effect listens for changes in the authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);
  // The AuthProvider component provides the user and loading state to its children
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
// This hook allows components to access the authentication context
export function useAuth() {
  return useContext(AuthContext);
}