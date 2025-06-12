import React, { useState } from "react";
import { Box, TextField, Button, Paper } from "@mui/material";

// This component renders a text input field and a button to add tasks.
// It allows users to enter a task and add it to a list by clicking the button or pressing Enter.
// The input is cleared after adding a task, and it prevents adding empty tasks.
// It is called in the main application to allow users to input tasks easily.
export default function AddText({ addItem }) {
  // State to manage the input value
  const [input, setInput] = useState("");
  // Function to handle adding the item
  const handleAdd = () => {
    if (input.trim()) {
      addItem(input.trim());
      setInput("");
    }
  };
  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Box
      sx={{
        display: "flex", 
        flexDirection: "column", // Stack elements vertically
        alignItems: "center", // Center the content
        justifyContent: "center", // Center the content vertically
        width: "100%", 
        margin: "0 auto", 
      }}
    >
      <Paper
        elevation={6}
        // This Paper component provides a card-like background for the input and button
        sx={{
          padding: "20px",
          borderRadius: "12px",
          width: "55%", 
          background: "linear-gradient(135deg, #ffffff, #f5f5f5)",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        {/* TextField for input */}
        <TextField
          id="task-input"
          label="Enter Task"
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          fullWidth
          sx={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />
        {/* Button to add the task */}
        <Button
          variant="contained"
          onClick={handleAdd}
          sx={{
            backgroundColor: "#00796b",
            color: "#ffffff",
            fontWeight: 600,
            mt: 2,
            px: 4,
            py: 1.5,
            borderRadius: "8px",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#00695c",
            },
          }}
        >
          Add Task ＋
        </Button>
      </Paper>
    </Box>
  );
}