let lastSentCommand = "";
let lastSentTime = 0;

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
  Slider,
  InputAdornment,
} from "@mui/material";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import confetti from "canvas-confetti";
import { firestore } from "./firebase"; // your firebase config file
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { getDatabase, ref, onValue, set } from "firebase/database";
import app from "./firebase";
import { getAuth } from "firebase/auth";

// This component implements a timer with both count-up and countdown modes.
// It allows users to track time spent on tasks, take breaks, and reflect on their progress.
  export default function Timer({
    onTimerEnd,
    initialBreaks,
    currentTask,
    currentSubtask,
    onTimeAdjust, 
    onTriggerMotivation,
  }) {
    const [timerMode, setTimerMode] = useState("countup");
    // For countdown: store the duration in seconds (default 10 minutes)
    const [countdownDuration, setCountdownDuration] = useState(600);
    // For count-up mode (time elapsed) and countdown mode (time remaining)
    const [timeElapsed, setTimeElapsed] = useState(0);
    // For countdown mode: time remaining
    const [timeRemaining, setTimeRemaining] = useState(countdownDuration);
    // whether the timer is running
    const [timerRunning, setTimerRunning] = useState(false);
    // timestamp when timer started/resumed
    const [startTime, setStartTime] = useState(null); 
    // accumulated time from previous sessions
    const [accumulatedTime, setAccumulatedTime] = useState(0); 
    // whether the task is open
    const [openTaskDialog, setOpenTaskDialog] = useState(false);
    // whether the task is pasued
    const [breaksTaken, setBreaksTaken] = useState(initialBreaks);
    // whether the task is pasued then display a message
    const [breakMessage, setBreakMessage] = useState("");
    // Set submitted to true so that we display the final complete view.
    const [submitted, setSubmitted] = useState(false);
    // whether the task is cancaelled - go back to home
    const [openCancelDialog, setOpenCancelDialog] = useState(false); 
    // handle self-reflection
    const [reflectAfterClose, setReflectAfterClose] = useState(false);
    // send command to firebase
    const auth = getAuth();
    const user = auth.currentUser;      

  // -- Helpers --
  const breakMessages = [
    "Reconnect your inner voice, do you REALLY need a break?😳",
  ];

  // Send command to firebase
  const sendCommand = (command) => {
    const now = Date.now();
    if (command === lastSentCommand && now - lastSentTime < 1000) return;

    lastSentCommand = command;
    lastSentTime = now;

    const db = getDatabase();
    set(ref(db, "/webCommand"), command);
  };

  // Handle self-reflection
  const handleSelfReflect = () => {
    setReflectAfterClose(true);
    setOpenTaskDialog(false);
  };

  // Handle self-reflection for the cancel dialog:
 const handleSelfReflectCancel = () => {
   setReflectAfterClose(true);
   setOpenCancelDialog(false);
 };

  // Load audio files for success and failure
  let wonAudio = new Audio ('https://orteil.dashnet.org/cookieclicker/snd/chime.mp3');
  let sadAudio = new Audio ('https://www.jedisaber.com/ST/Sounds/STTNG35.WAV')

  // Handle time resume 
  const handleResumeTimer = () => {
    if (startTime === null) {
      setStartTime(Date.now());
      setTimerRunning(true);
    }
  };

  // Handle cancel finish
  const handleCancelFinish = () => {
    setOpenTaskDialog(false);
    setOpenCancelDialog(false);
  };

  // Pause/resume logic 
  const handlePauseResume = () => {
    if (timerRunning) {
      if (timerMode === "countup") {
        setAccumulatedTime(timeElapsed);
      } else if (timerMode === "countdown") {
        const elapsed = countdownDuration - timeRemaining;
        setAccumulatedTime(elapsed);
      }
      setStartTime(null);
      setTimerRunning(false);
      setBreaksTaken((prev) => prev + 1);
      setBreaksTaken((prev) => prev + 1);
      setBreakMessage(breakMessages[Math.floor(Math.random() * breakMessages.length)]);
    } else {
      setStartTime(Date.now());
      setTimerRunning(true);
    }
  };

  // Start the timer and initialize the relevant time variables.
  const handleStartTimer = () => {
    setAccumulatedTime(0);
    if (timerMode === "countup") {
      setTimeElapsed(0);
    } else if (timerMode === "countdown") {
      setTimeRemaining(countdownDuration);
    }
    setStartTime(Date.now());
    setTimerRunning(true);
  };

  // When finishing, pass the elapsed time based on mode.
  const handleFinishTask = async () => {
    setOpenTaskDialog(false);
    setTimerRunning(false);
  
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
  
    const statsUserDocRef = doc(firestore, "statistics", user.uid);
    const statsDefaultDocRef = doc(firestore, "statistics", "default");
  
    const currentElapsed =
      startTime !== null ? Math.floor((Date.now() - startTime) / 1000) : 0;
    const elapsedTime =
      timerMode === "countup"
        ? accumulatedTime + currentElapsed
        : countdownDuration - timeRemaining;
  
    if (currentSubtask) {
      onTimerEnd(elapsedTime, breaksTaken, {
        ...currentSubtask,
        taskId: currentTask.id,
      });
    } else {
      onTimerEnd(elapsedTime, breaksTaken, currentTask);
    }
  
    setStartTime(null);
  
    try {
      // Helper to fetch, add time, and update a doc
      const updateTimeDoc = async (ref) => {
        const snap = await getDoc(ref);
        const previousSeconds = snap.exists()
          ? parseTimeStringToSeconds(snap.data().totalTimeStudied || "00:00:00")
          : 0;
  
        const newTotalTime = previousSeconds + elapsedTime;
        const hours = Math.floor(newTotalTime / 3600);
        const minutes = Math.floor((newTotalTime % 3600) / 60);
        const seconds = newTotalTime % 60;
        const formattedTime = `${String(hours).padStart(2, "0")}:${String(
          minutes
        ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  
        if (snap.exists()) {
          await updateDoc(ref, { totalTimeStudied: formattedTime });
        } else {
          await setDoc(ref, { totalTimeStudied: formattedTime });
        }
      };
  
      // Update both user and default stats
      await Promise.all([
        updateTimeDoc(statsUserDocRef),
        updateTimeDoc(statsDefaultDocRef)
      ]);
  
      setSubmitted(true);
    } catch (error) {
      console.error("Error updating stats in Firebase:", error);
      alert("Error updating stats.");
    }
  };

  // voice command, get command transcription from Firebase then use it to control the timer
  useEffect(() => {
    const db = getDatabase(app); // Initialize Firebase Realtime Database
    const commandRef = ref(db, "/voiceCommand"); // Reference to the voice command node in Firebase
  
    // Listen for changes to the voice command in Firebase
    // This will trigger whenever a new command is set in Firebase
    const unsubscribe = onValue(commandRef, (snapshot) => {
      const voiceCommand = snapshot.val();
      if (!voiceCommand) return;
  
      const lower = voiceCommand.toLowerCase().trim();
      console.log("Voice command received:", lower);
  
      // keyword matching from transcription
      const startKeywords = ["start", "begin", "resume", "go", "play", "continue"];
      const pauseKeywords = ["pause", "stop", "hold", "break", "take a break"];
      const finishKeywords = ["home", "finish", "done", "go back", "end task"];
  
      const matchesKeyword = (command, keywords) =>
        keywords.some((kw) => command.includes(kw));
  
      if (matchesKeyword(lower, pauseKeywords) && timerRunning) {
        console.log("Pausing via voice...");
        handlePauseResume();  // Pause
      } else if (matchesKeyword(lower, startKeywords)) {
        if (!timerRunning) {
          if (accumulatedTime > 0 || timeElapsed > 0 || timeRemaining < countdownDuration) {
            console.log("Resuming via voice...");
            handleResumeTimer(); // Resume
          } else {
            console.log("Starting fresh via voice...");
            handleStartTimer(); // Start
          }
        }
      } else if (matchesKeyword(lower, finishKeywords)) {
        console.log("Finishing task via voice...");
        handleFinishTask();
      }
  
      // Reset to avoid re-triggering
      set(commandRef, "");
    });
  
    return () => unsubscribe();
  }, [timerRunning, startTime, accumulatedTime, handleResumeTimer, handlePauseResume, handleStartTimer, handleFinishTask]);

  // Update the timer every second when running
  useEffect(() => {
    let timerInterval;
    if (timerRunning && startTime !== null) {
      timerInterval = setInterval(() => {
        const elapsed =
          accumulatedTime + Math.floor((Date.now() - startTime) / 1000);
        if (timerMode === "countup") {
          setTimeElapsed(elapsed);
        } else if (timerMode === "countdown") {
          const remaining = countdownDuration - elapsed;
          if (remaining <= 0) {
            setTimeRemaining(0);
            setTimerRunning(false);
            clearInterval(timerInterval);
            // End the timer for countdown mode once time runs out
            onTimerEnd(countdownDuration, breaksTaken, currentSubtask || currentTask);
          } else {
            setTimeRemaining(remaining);
          }
        }
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [
    timerRunning,
    startTime,
    accumulatedTime,
    timerMode,
    countdownDuration,
    breaksTaken,
    currentTask,
    currentSubtask,
    onTimerEnd,
  ]);

  // Format seconds into mm:ss format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  // Function to parse time string in HH:MM:SS or MM:SS format to seconds
  const parseTimeStringToSeconds = (timeStr) => {
    const parts = timeStr.split(":").map(Number);
    if (parts.length === 3) {
      // HH:MM:SS format
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // MM:SS format
      return parts[0] * 60 + parts[1];
    }
    return 0;
  };

  // Handle task completion - play audio, show confetti, and open dialog
  const handleDone = () => {
    wonAudio.play();
    confetti();
    setOpenTaskDialog(true);
  };

  // Handle task failure - play sad audio and open cancel dialog
  const handleFail = () => {
    sadAudio.play();
    setOpenCancelDialog(true);
  };

  // -- Render UI --
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        gap: 3,
        padding: 3,
        background: "linear-gradient(135deg, #e0f7fa, #e0f2f1)",
        borderRadius: 3,
      }}
    >
      {/* Timer Mode Selector */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button
          onClick={() => setTimerMode("countup")}
          variant={timerMode === "countup" ? "contained" : "outlined"}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            backgroundColor: timerMode === "countup" ? "#00796b" : "transparent",
            color: timerMode === "countup" ? "#fff" : "#00796b",
            borderColor: "#00796b",
            "&:hover": {
              backgroundColor: timerMode === "countup" ? "#00695c" : "rgba(0,121,107,0.04)",
            },
          }}
        >
          Stopwatch ⬆️
        </Button>
        <Button
          onClick={() => setTimerMode("countdown")}
          variant={timerMode === "countdown" ? "contained" : "outlined"}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            backgroundColor: timerMode === "countdown" ? "#00796b" : "transparent",
            color: timerMode === "countdown" ? "#fff" : "#00796b",
            borderColor: "#00796b",
            "&:hover": {
              backgroundColor: timerMode === "countdown" ? "#00695c" : "rgba(0,121,107,0.04)",
            },
          }}
        >
          Timer ⬇️
        </Button>
      </Box>

      {/* For countdown mode: allow custom duration when not running */}
      {!timerRunning && timerMode === "countdown" && (
        <Box
          sx={{
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* Label in your brand green */}
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: '#00796b', minWidth: 140 }}
          >
            Countdown (min):
          </Typography>

          {/* Number input with styled border & text */}
          <TextField
            type="number"
            size="small"
            variant="outlined"
            inputProps={{
              min: 0,
              step: 1,
              style: { textAlign: 'center' }
            }}
            sx={{
              width: 80,
              // outline & text in brand green
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#00796b' },
                '&:hover fieldset': { borderColor: '#004d40' },
                '&.Mui-focused fieldset': { borderColor: '#00796b' },
              },
              '& .MuiInputBase-input': {
                color: '#00796b',
                fontWeight: 600,
              }
            }}
            value={Math.floor(countdownDuration / 60)}
            onChange={(e) => {
              const mins = Math.max(0, Number(e.target.value));
              const secs = mins * 60;
              setCountdownDuration(secs);
              setTimeRemaining(secs);
            }}
          />
        </Box>
      )}

      {/* Display title: if a subtask is passed, show its name */}
      <Typography variant="h5" sx={{ fontWeight: 700, color: "#00796b" }}>
        {currentSubtask ? currentSubtask.name : currentTask?.name || "No Task Selected"}
      </Typography>

      {/* Timer Display with Add/Subtract Buttons */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
        {/* Subtract Button */}
        <IconButton
          onClick={() => {
            setTimerRunning(false); // Pause timer
            if (timerMode === "countup") {
              const diff = -60; // subtract 60 seconds
              setTimeElapsed((prev) => Math.max(0, prev + diff));
              setAccumulatedTime((prev) => Math.max(0, prev + diff));
            } else if (timerMode === "countdown") {
              const diff = -60; // subtract 60 seconds
              setTimeRemaining((prev) => Math.max(0, prev + diff));
            }
          }}
          sx={{ color: "#d32f2f" }}
        >
          ➖
        </IconButton>

        {/* Pause/Resume Button */}
        <IconButton
          onClick={() => {
            if (!timerRunning && timerMode === "countdown" && timeRemaining === countdownDuration) {
              // Fresh countdown start: reset to full duration
              sendCommand("WELL DONE, I'm so proud of you!!");
              handleStartTimer();
            } else {
              // Either pausing or resuming
              if (timerRunning) {
                sendCommand("WHY YOU TAKING A BREAK?!");
              } else {
                sendCommand("WELL DONE, I'm so proud of you!!");
              }
              handlePauseResume();
            }
          }}
          sx={{ color: "#00796b" }}
        >
          {timerRunning
            ? <PauseCircleOutlineIcon sx={{ fontSize: 50 }} />
            : <PlayCircleOutlineIcon sx={{ fontSize: 50 }} />}
        </IconButton>

        {/* Timer Display */}
        <Typography variant="h3" sx={{ fontWeight: "bold", color: "#00796b" }}>
          {timerMode === "countup" ? formatTime(timeElapsed) : formatTime(timeRemaining)}
        </Typography>

        {/* Add Button */}
        <IconButton
          onClick={() => {
            setTimerRunning(false); // Pause timer
            if (timerMode === "countup") {
              const diff = 60; // seconds to add
              // Update both display and accumulated time
              setTimeElapsed((prev) => prev + diff);
              setAccumulatedTime((prev) => prev + diff);
            } else if (timerMode === "countdown") {
              const diff = 60; // seconds to add
              setTimeRemaining((prev) => prev + diff);
            }
          }}
          sx={{ color: "#388e3c" }}
        >
          ➕
        </IconButton>
      </Box>

      {/* Display Break Message only when paused */}
      {!timerRunning &&
        ((timerMode === "countup" && timeElapsed > 0) ||
          (timerMode === "countdown" && timeRemaining < countdownDuration)) && (
          <Typography variant="body1" sx={{ fontStyle: "italic", color: "#f57c00", fontWeight: 500, mt: 1 }}>
            {breakMessage}
          </Typography>
        )}

      {/* Timer Actions */}
      <Box sx={{ display: "flex", gap: 2 }}>
      <Button
        variant="contained"
        sx={{
          backgroundColor: "#8fbc8f",
          color: "#ffffff",
          px: 4,
          py: 1.5,
          borderRadius: 2,
          "&:hover": { backgroundColor: "#228b22" },
        }}
        onClick={() => {
          sendCommand("Well done, you will achieve great things!");
          handleDone();
        }}
      >
        Finish Task 🎯
      </Button>
    </Box>

    <Box sx={{ display: "flex", gap: 2 }}>
      <Button
        variant="contained"
        sx={{
          backgroundColor: "#b22222",
          color: "#ffffff",
          px: 4,
          py: 1.5,
          borderRadius: 2,
          "&:hover": { backgroundColor: "#8b0000" },
        }}
        onClick={() => {
          sendCommand("UNBELIEVABLE. DO BETTER NEXT TIME.");
          handleFail();
        }}
      >
        I'll come back to this task later 👉🏼👈🏼
      </Button>
    </Box>

    {/* Task Completion Dialog */}
    <Dialog
      open={openTaskDialog}
      onClose={() => {
        // Only close the dialog here
        setOpenTaskDialog(false);
        handleCancelFinish();
      }}
      TransitionProps={{
        // onExited only fires once the dialog has fully unmounted (after its fade-out)
        onExited: () => {
          if (reflectAfterClose) {
            setReflectAfterClose(false);
            onTriggerMotivation(); // ← Now runs *after* the dialog is gone
          }
        },
      }}
    >
      {/* Dialog Title - pops up when user clicks finish task*/}
      <DialogTitle>🎉 Great job finishing your task!</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Before moving on:  
          Your inner voice gets sharper every time you reflect. Let’s level up your focus! 🌟 
          <br /> 
          Fill out your reflections in the motivational section! 💭
          <br /> 
          🤓 Complete a quick quiz to earn coins and strengthen your study strategy.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelFinish} sx={{ color: "#00796b" }}>
          Cancel 🚫
        </Button>
        <Button onClick={handleFinishTask} sx={{ color: "#00796b" }}>
          Back to Home 🏠
        </Button>
        <Button onClick={handleSelfReflect} sx={{ color: "#00796b", fontWeight: 'bold' }}>
          Reflect Now ✍️
        </Button>
      </DialogActions>
    </Dialog>

    {/* Task Cancel Dialog */}
    <Dialog
      open={openCancelDialog}
      onClose={() => {
        // Close the cancel dialog immediately
        setOpenCancelDialog(false);
        handleCancelFinish();
      }}
      TransitionProps={{
        // onExited fires only after the dialog has fully unmounted/faded out
        onExited: () => {
          if (reflectAfterClose) {
            setReflectAfterClose(false);
            onTriggerMotivation(); // Launch MotivationPage after dialog is gone
          }
        },
      }}
    >
      {/* Dialog Title - pops up when user clicks on give up task*/}
      <DialogTitle>Oh no 😡</DialogTitle>
      <DialogContent>
        <DialogContentText>
          If you need to switch up the content, that's okay, just
          remind yourself of your goals before giving up on this task! 👍
          <br />
          Take a moment to reflect and reconnect your inner thoughts, click "Reflect Now ✍️"!
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelFinish} sx={{ color: "#00796b" }}>
          Cancel 🚫
        </Button>
        <Button onClick={handleFinishTask} sx={{ color: "#00796b" }}>
          Back to Home 🙁
        </Button>
       <Button onClick={handleSelfReflectCancel} sx={{ color: "#00796b", fontWeight: 'bold' }}>
          Reflect Now ✍️
        </Button>
      </DialogActions>
    </Dialog>
    </Box>
  );
}
