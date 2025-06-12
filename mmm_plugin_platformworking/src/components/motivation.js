import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Tooltip } from "@mui/material";

// This component provides a motivational page where users can view, add, and manage motivational quotes and self-reflections.
// These are the default quotes
const defaultQuotes = [
  "Your potential is endless. Go do what you were created to do. 💡",
  "Don't limit your challenges. Challenge your limits. 🚀",
  "It’s okay to rest, but don’t quit. Keep going. 🌟",
  "Your only limit is your mind. Change your thoughts, change your life. 💭",
  "Believe in yourself and your ability to succeed. 💪",
];

// This component renders a motivational page with quotes and self-reflections.
export default function MotivationPage({ onClose, addItem }) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  // We'll initialize these from localStorage or fall back to defaults.
  const [quotes, setQuotes] = useState([]); // Store quotes in state
  const [selfQuestions, setSelfQuestions] = useState([]); // Store self-reflections in state
  const [newQuote, setNewQuote] = useState(""); // Input for new quote
  const [selfQuestionInput, setSelfQuestionInput] = useState(""); // Input for self-reflection question
  const [editingIndex, setEditingIndex] = useState(null); // Index of the reflection being edited
  const [editedReflectionText, setEditedReflectionText] = useState(""); // Text of the reflection being edited

  // read local storage for quotes & reflections
  useEffect(() => {
    // Try to read quotes from localStorage
    const storedQuotes = localStorage.getItem("motivationQuotes");
    if (storedQuotes) {
      setQuotes(JSON.parse(storedQuotes));
    } else {
      // If none stored, use default quotes
      setQuotes(defaultQuotes);
    }

    // Try to read reflections from localStorage
    const storedReflections = localStorage.getItem("motivationSelfReflections");
    if (storedReflections) {
      setSelfQuestions(JSON.parse(storedReflections));
    } else {
      // If none stored, initialize with an empty array
      setSelfQuestions([]);
    }
  }, []);

  // Whenever quotes change, store them
  useEffect(() => {
    localStorage.setItem("motivationQuotes", JSON.stringify(quotes));
  }, [quotes]);

  // Whenever selfQuestions change, store them
  useEffect(() => {
    localStorage.setItem(
      "motivationSelfReflections",
      JSON.stringify(selfQuestions)
    );
  }, [selfQuestions]);

  // Handlers for quotes
  const handleAddQuote = () => {
    if (newQuote.trim()) {
      setQuotes((prev) => [...prev, newQuote.trim()]);
      setNewQuote("");
    }
  };

  // Delete a quote by index
  const handleDeleteQuote = (index) => {
    const updated = quotes.filter((_, i) => i !== index);
    setQuotes(updated);
    if (quoteIndex >= updated.length) setQuoteIndex(0); // Reset index if needed
  };

  // Function to get the next quote
  const nextQuote = () => {
    setQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
  };

  // Handlers for self reflections
  const handleSelfQuestionSave = () => {
    if (selfQuestionInput.trim() !== "") {
      const timestamp = new Date().toLocaleString();
      const newReflection = {
        text: selfQuestionInput,
        timestamp,
      };
      setSelfQuestions((prev) => [...prev, newReflection]);
      setSelfQuestionInput("");
    }
  };

  // Handle Enter key for self reflection input
  const handleSelfQuestionKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSelfQuestionSave();
    }
  };

  // Edit reflection handlers
  const handleEditReflection = (index) => {
    setEditingIndex(index);
    setEditedReflectionText(selfQuestions[index].text);
  };

  // Cancel editing reflection
  const handleCancelReflection = () => {
    setEditingIndex(null);
    setEditedReflectionText("");
  };

  // Save edited reflection
  const handleSaveReflection = (index) => {
    const updatedReflections = [...selfQuestions];
    updatedReflections[index] = {
      ...updatedReflections[index],
      text: editedReflectionText,
      timestamp: new Date().toLocaleString(), // update timestamp upon editing
    };
    setSelfQuestions(updatedReflections);
    setEditingIndex(null);
    setEditedReflectionText("");
  };

  // Delete a reflection by index
  const handleDeleteReflection = (index) => {
    const updatedReflections = selfQuestions.filter((_, i) => i !== index);
    setSelfQuestions(updatedReflections);
  };

  // Reset quotes to default
  const handleResetQuotes = () => {
    setQuotes(defaultQuotes);
    setQuoteIndex(0);
    localStorage.setItem("motivationQuotes", JSON.stringify(defaultQuotes));
  };

  return (
    // Main container for the motivational page
    <Box
      sx={{
        width: "90%",
        maxWidth: "1400px",
        margin: "20px auto",
        padding: 4,
        background: "linear-gradient(135deg, #e0f7fa 0%, #e0f2f1 100%)",
        borderRadius: "12px",
        boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.1)",
        justifyContent: "center",
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, textAlign: "center" }}>
        ✨ Motivational Boost ✨
      </Typography>

      {/* Display Current Quote */}
      <Typography variant="h6" sx={{ fontStyle: "italic", mb: 1 , textAlign: "center" }}>
        {quotes[quoteIndex]}
      </Typography>

      {/* Buttons for Next & Delete */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          mb: 2,
        }}
      >
        <Button
          variant="contained"
          onClick={nextQuote}
          sx={{ backgroundColor: "#CE93D8", color: "#FFFFFF" }}
        >
          Next Quote 🔄
        </Button>
        {/* Delete */}
        <Tooltip title="Delete Current Quote">
          <IconButton
            onClick={() => handleDeleteQuote(quoteIndex)}
            size="small"
          >
            <DeleteIcon fontSize="large" />
          </IconButton>
        </Tooltip>
        {/* Refresh */}
        <Tooltip title="Refresh Quotes">
          <IconButton
            onClick={handleResetQuotes}
            size="small"
            sx={{
              color: "#CE93D8",
              "&:hover": {
              color: "#ab47bc",
              },
            }}
          >
            <RefreshIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Add a new Quote */}
      <TextField
        label="Add your own motivational quote"
        variant="outlined"
        fullWidth
        multiline
        rows={2}
        value={newQuote}
        onChange={(e) => setNewQuote(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleAddQuote();
          }
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": {
            borderColor: "#088F8F",
            },
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#088F8F",
          },
        }}
      />

      <Button
        variant="contained"
        onClick={handleAddQuote}
        sx={{
          display: "block",     
          mx: "auto",         
          backgroundColor: "#aed581",
          mt: 1,
          mb: 2,
        }}
      >
        Add Quote ✍️
      </Button>

      {/* Self Reflection Section */}
      <Box sx={{ mt: 4, justifyContent: "center", textAlign: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          Self Reflection 🤔
        </Typography>

        <TextField
          label="Enter your thought or question"
          variant="outlined"
          fullWidth
          multiline
          rows={2}
          value={selfQuestionInput}
          onChange={(e) => setSelfQuestionInput(e.target.value)}
          onKeyDown={handleSelfQuestionKeyDown}
          sx={{
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: "#088F8F",
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#088F8F",
            },
          }}
        />

        <Button
          variant="contained"
          onClick={handleSelfQuestionSave}
          sx={{ backgroundColor: "#90caf9", mt: 2, mb: 2, justifyContent: "center" }}
        >
          Save Reflection 📝
        </Button>

        <Paper
          elevation={3}
            sx={{
              height: "auto",
              overflowY: "auto",
              padding: 2,
              textAlign: "left",
              width: "auto",
              margin: "0 auto",
            }}
        >
          {/* Display saved self reflections */}
          {selfQuestions.length > 0 ? (
            selfQuestions.map((reflection, index) => (
              <Box
                key={index}
                sx={{
                  mb: 1,
                  borderBottom: "1px solid #ccc",
                  paddingBottom: "4px",
                }}
              >
                {editingIndex === index ? (
                  <>
                    <TextField
                      value={editedReflectionText}
                      onChange={(e) => setEditedReflectionText(e.target.value)}
                      fullWidth
                      multiline
                    />
                    <Box sx={{ mt: 1 }}>
                      <Button
                        onClick={() => handleSaveReflection(index)}
                        variant="contained"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        Save
                      </Button>
                      <Button
                        onClick={handleCancelReflection}
                        variant="outlined"
                        size="small"
                      >
                        Cancel
                      </Button>
                    </Box>
                  </>
                ) : (
                  <>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        mb: 1,
                        background: "#ffffff",
                        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      {/* Display the reflection text and timestamp */}
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center",maxHeight: "300px" }}>
                        <Box>
                          <Typography variant="body1" sx={{ mb: 0.5 }}>
                            {reflection.text}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {reflection.timestamp}
                          </Typography>
                        </Box>
                        <Box>
                          <IconButton
                            onClick={() => handleEditReflection(index)}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteReflection(index)}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Paper>
                  </>
                )}
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No self reflections saved.
            </Typography>
          )}
        </Paper>
      </Box>

      <Button
        variant="contained"
        onClick={onClose}
        sx={{
          display: "block",    
          mx: "auto",          
          backgroundColor: "#088F8F",
          mt: 2,
          mb: 2,
        }}
      >
        Back To Tasks 📚
      </Button>
    </Box>
  );
}
