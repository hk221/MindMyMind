import React from "react";
import AuthForm from "./components/LoginForm";
import List from "./components/TopParentComponent";
import { AuthProvider, useAuth } from "./components/AuthContext";
/**
 * @param {PluginProps} props
 */

export default function Plugin(props) {
  return (
    <AuthProvider>
      <PluginContent />
    </AuthProvider>
  );
}
function PluginContent() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <AuthForm onLogin={() => console.log("User logged in")} />;
  }

  return <List />;
}