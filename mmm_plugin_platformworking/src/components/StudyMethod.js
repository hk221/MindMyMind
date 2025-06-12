import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Paper,
  Divider,
  Stack,
} from "@mui/material";

// Function to determine the study method based on user preferences and study data
const determineStudyMethod = ({
  totalTimeStudied,
  breaksTaken,
  tasks,
  prefersRepetition,
  prefersLongBlocks,
  prefersFrequentIntervals,
  prefersWriting,
}) => {
  const breaksPerHour =
    totalTimeStudied > 0 ? breaksTaken / (totalTimeStudied / 3600) : 0; // Calculate breaks per hour
  const averageTimePerTask =
    tasks.length > 0 ? Math.floor(totalTimeStudied / tasks.length) : 0; // Calculate average time per task

  let method = "";

  // Determine the study method based on total time studied and user preferences
  if (totalTimeStudied < 30 * 60) {
    method = prefersRepetition === "yes" ? "Active Recall 🤓" : "Flashcards 🃏";
  } else if (totalTimeStudied <= 120 * 60) {
    method =
      prefersFrequentIntervals === "yes"
        ? "Pomodoro (25-5 or 50-10) 🍅"
        : "Pomodoro Technique 🍅";
  } else {
    method =
      prefersLongBlocks === "yes"
        ? "Deep Work (90-min focus blocks) 💪"
        : "Spaced Repetition 🔄";
  }

  // Add details based on breaks taken and average time per task
  if (breaksPerHour < 1) {
    method += " with short, focused sessions ✨";
  } else if (breaksPerHour <= 2) {
    method += " with balanced breaks ⚖️";
  } else {
    method +=
      prefersLongBlocks === "yes"
        ? " and long reviews 📚"
        : " with interleaving 🔀";
  }

  // Add details based on average time per task and writing preference
  if (averageTimePerTask < 10) {
    method += " and quick reviews ⚡";
  } else if (averageTimePerTask <= 30) {
    method +=
      prefersWriting === "yes"
        ? " plus Cornell note-taking 📝"
        : " plus mixed practice 🔄";
  } else {
    method +=
      totalTimeStudied > 120 * 60
        ? " with deep focus sessions 🎯"
        : " with thorough reviews 🎯";
  }

  return method;
};

export default function StudyMethod({
  open,
  onClose,
  totalTimeStudied,
  breaksTaken,
  tasks,
  onSubmit,
}) {
  // State to manage user preferences for study methods
  const [preferences, setPreferences] = useState({
    prefersRepetition: "no",
    prefersLongBlocks: "yes",
    prefersFrequentIntervals: "yes",
    prefersWriting: "no",
  });

  const [recommendedMethod, setRecommendedMethod] = useState(""); // State to hold the recommended study method

  // Effect to determine the recommended study method based on user preferences and study data
  // This effect runs whenever preferences, totalTimeStudied, breaksTaken, or tasks change
  // It updates the recommendedMethod state with the result of determineStudyMethod function
  useEffect(() => {
    const method = determineStudyMethod({
      totalTimeStudied,
      breaksTaken,
      tasks,
      ...preferences,
    });
    setRecommendedMethod(method);
  }, [preferences, totalTimeStudied, breaksTaken, tasks]);

  // Function to handle changes in user preferences
  const handleChange = (event) => {
    const { name, value } = event.target;
    setPreferences((prevPreferences) => ({
      ...prevPreferences,
      [name]: value,
    }));
  };

  if (!open) return null;

  return (
    // Main container for the study method component
    <Box sx={{ 
      width: "90%", 
      maxWidth: "1400px", 
      margin: "20px auto", 
      padding: 4, 
      background: "linear-gradient(135deg, #e0f7fa 0%, #e0f2f1 100%)", 
      borderRadius: "12px", 
      boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.1)" ,
      justifyContent: "center",
      }}
    >
      {/* Title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: "#00796b",
          textAlign: "center",
          mb: 3,
        }}
      >
        Study Preferences 🎓
      </Typography>

      {/* Preferences Form */}
      <Box
        sx={{
          backgroundColor: "#ffffff",
          p: 3,
          borderRadius: 2,
          boxShadow: 2,
          mb: 3,
        }}
      >
        {/* Form to capture user preferences for study methods */}
        <Stack spacing={3}>
          <FormControl component="fieldset">
            <FormLabel
              component="legend"
              sx={{ fontWeight: 600, color: "#004d40", mb: 1 }}
            >
              Do you prefer to repeat content (Active Recall) or use flashcards?
            </FormLabel>
            <RadioGroup
              row
              name="prefersRepetition"
              value={preferences.prefersRepetition}
              onChange={handleChange}
            >
              <FormControlLabel
                value="yes"
                control={<Radio sx={{ color: "#00796b" }} />}
                label="Repeat Content"
              />
              <FormControlLabel
                value="no"
                control={<Radio sx={{ color: "#00796b" }} />}
                label="Flashcards"
              />
            </RadioGroup>
          </FormControl>

          <FormControl component="fieldset">
            <FormLabel
              component="legend"
              sx={{ fontWeight: 600, color: "#004d40", mb: 1 }}
            >
              Do you prefer long study blocks or frequent intervals?
            </FormLabel>
            <RadioGroup
              row
              name="prefersLongBlocks"
              value={preferences.prefersLongBlocks}
              onChange={handleChange}
            >
              <FormControlLabel
                value="yes"
                control={<Radio sx={{ color: "#00796b" }} />}
                label="Long Blocks"
              />
              <FormControlLabel
                value="no"
                control={<Radio sx={{ color: "#00796b" }} />}
                label="Frequent Intervals"
              />
            </RadioGroup>
          </FormControl>

          <FormControl component="fieldset">
            <FormLabel
              component="legend"
              sx={{ fontWeight: 600, color: "#004d40", mb: 1 }}
            >
              Do you prefer writing or reading during study sessions?
            </FormLabel>
            <RadioGroup
              row
              name="prefersWriting"
              value={preferences.prefersWriting}
              onChange={handleChange}
            >
              <FormControlLabel
                value="yes"
                control={<Radio sx={{ color: "#00796b" }} />}
                label="Writing"
              />
              <FormControlLabel
                value="no"
                control={<Radio sx={{ color: "#00796b" }} />}
                label="Reading"
              />
            </RadioGroup>
          </FormControl>
        </Stack>
      </Box>

      {/* Divider */}
      <Divider sx={{ my: 2 }} />

      {/* Recommended Study Method - Scrollable */}
      <Box
        sx={{
          backgroundColor: "#ffffff",
          p: 3,
          borderRadius: 2,
          boxShadow: 2,
          maxHeight: "150px",
          overflowY: "auto",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: "#004d40", textAlign: "center", mb: 2 }}
        >
          Recommended Study Method:
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontStyle: "italic",
            color: "#004d40",
            fontSize: "1.1rem",
            textAlign: "center",
          }}
        >
          {recommendedMethod}
        </Typography>
      </Box>

      {/* Divider */}
      <Divider sx={{ my: 3 }} />

      {/* Back Button */}
      <Box sx={{ textAlign: "center" }}>
        <Button
          onClick={onClose}
          sx={{
            backgroundColor: "#00796b",
            color: "#ffffff",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#00695c",
            },
          }}
        >
          Back 🏡
        </Button>
      </Box>
    </Box>
  );
}
