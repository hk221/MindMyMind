// AuthForm.jsx
import React, { useState } from "react";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { TextField, Button, Typography, Box, Link } from "@mui/material";

// This component provides a form for user authentication (login/signup) using Firebase.
export default function AuthForm({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login/signup
  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input

  // Function to handle authentication based on the form state (login or signup)
  const handleAuth = async () => {
    try {
      const userCred = isLogin
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);

      onLogin(userCred.user.uid);
    } catch (error) {
      alert(`Auth failed: ${error.message}`);
    }
  };

  // Render the form with text fields for email and password, and a button to submit
  // Also includes a toggle link to switch between login and signup
  return (
    <Box sx={{ maxWidth: 320, mx: "auto", textAlign: "center", mt: 8 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {isLogin ? "Login" : "Sign Up"}
      </Typography>
      {/* Text fields for email and password input */}
      <TextField
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleAuth}
      >
        {isLogin ? "Login" : "Sign Up"}
      </Button>

      <Typography variant="body2" sx={{ mt: 2 }}>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <Link
          component="button"
          variant="body2"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Sign Up" : "Login"}
        </Link>
      </Typography>
    </Box>
  );
}