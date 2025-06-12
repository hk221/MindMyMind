import {
  Box,
  Button,
  Typography,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Paper,
} from "@mui/material";
import TimerIcon from "@mui/icons-material/Timer";
import FreeBreakfastIcon from "@mui/icons-material/FreeBreakfast";
import AvgTimeIcon from "@mui/icons-material/Schedule";
import StarIcon from "@mui/icons-material/Star";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useAuth } from "./AuthContext";
import React, { useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "./firebase";

// This component displays a dialog with study statistics, including total time studied, breaks taken, tasks completed, and focus score.
export default function StatisticsDialog({
  open,
  onClose,
  totalTimeStudied,
  breaksTaken,
  tasks = [],
  studyHistory,
}) {
  const { user } = useAuth(); // Get the current authenticated user from context

  // Function to convert total minutes into HH:MM:SS format
  const minsToHHMMSS = (totalMins) => {
    const hours = Math.floor(totalMins / 60);
    const minutes = totalMins % 60;
    const seconds = 0;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  // Effect to upload total time studied to Firestore when the user or totalTimeStudied changes
  useEffect(() => {
    if (!user) return;
    const uploadStats = async () => {
      try {
        const statsRef = doc(firestore, "statistics", user.uid);

        // convert the raw minutes into HH:MM:SS
        const formatted = minsToHHMMSS(totalTimeStudied);

        await setDoc(
          statsRef,
          { totalTimeStudied: formatted }, // now a string like "02:15:00"
          { merge: true }
        );
        console.log("Updated totalTimeStudied for", user.uid, formatted);
      } catch (err) {
        console.error("Failed to update stats:", err);
      }
    };
    uploadStats();
  }, [user, totalTimeStudied]);

  if (!open) return null;

  // Function to format time in seconds into a more readable format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return hours > 0
      ? `${hours} hr ${remainingMinutes} min`
      : `${remainingMinutes} min`;
  };

  // Calculate average time per task
  const averageTimePerTask =
    tasks.length > 0 ? Math.floor(totalTimeStudied / tasks.length) : 0;

  // Calculate focus score based on total time studied and breaks taken
  const calculateFocusScore = () => {
    if (totalTimeStudied === 0) return 0;
    const hoursStudied = totalTimeStudied / 3600;
    const breaksPerHour = hoursStudied > 0 ? breaksTaken / hoursStudied : 0;
    const timeScore = Math.min((hoursStudied / 4) * 5, 5);
    const breakScore =
      breaksPerHour >= 0.5 && breaksPerHour <= 1.5
        ? 5
        : breaksPerHour < 0.5
        ? breaksPerHour * 10
        : Math.max(0, 5 - (breaksPerHour - 1.5) * 2);

    return Math.min(
      Math.max(Math.round((timeScore + breakScore) * 10) / 10, 0),
      10
    );
  };

  // Calculate the focus score
  const focusScore = calculateFocusScore();

  // Convert task times into chart data
  const taskChartData = tasks.map((task) => {
    const totalTaskTime =
      task.time +
      (task.subtasks.reduce((total, subtask) => total + subtask.time, 0) || 0);
    return { name: task.name, time: Math.round(totalTaskTime / 60) };
  });

  // Convert study history into chart data format (total time per day)
  const studyTrends = Object.entries(studyHistory).map(
    ([date, tasksForDay]) => ({
      date,
      time: Math.round(
        Object.values(tasksForDay).reduce(
          (total, taskTime) => total + taskTime,
          0
        ) / 60 // Sum all tasks per day
      ), // Convert seconds to minutes
    })
  );

  return (
    // Main container for the statistics dialog
    <Box
      sx={{
        width: "90%",
        maxWidth: "1400px",
        height: "90%",
        overflow: "auto",
        margin: "20px auto",
        padding: 4,
        background: "linear-gradient(135deg, #e0f7fa 0%, #e0f2f1 100%)",
        borderRadius: "12px",
        boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.1)",
        justifyContent: "center",
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 700, color: "#00796b", textAlign: "center", mb: 3 }}>
        Study Statistics 📊
      </Typography>
      <Box sx={{ backgroundColor: "#ffffff", p: 3, borderRadius: 2, boxShadow: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, textAlign: "center", mb: 2, color: "#004d40" }}>
          Overall Statistics
        </Typography>
        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="center"
          >
            <TimerIcon sx={{ color: "#00796b" }} />
            <Typography variant="body1">
              Total Time: {formatTime(totalTimeStudied)}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="center"
          >
            <AvgTimeIcon sx={{ color: "#00796b" }} />
            <Typography variant="body1">
              Avg per Task: {formatTime(averageTimePerTask)}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="center"
          >
            <FreeBreakfastIcon sx={{ color: "#f57c00" }} />
            <Typography variant="body1">Breaks Taken: {breaksTaken}</Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="center"
          >
            <StarIcon sx={{ color: "#FFD700" }} />
            <Typography variant="body1">
              Focus Score: {focusScore.toFixed(1)}/10
            </Typography>
            <Tooltip
              title="Higher scores mean better study efficiency with optimal breaks."
              arrow
            >
              <HelpOutlineIcon
                sx={{ fontSize: 18, color: "text.secondary", cursor: "help" }}
              />
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      <Divider sx={{ my: 2 }} />
      {/* Time Per Task Section */}
      <Box sx={{ backgroundColor: "#ffffff", p: 3, borderRadius: 2, boxShadow: 2, maxHeight: "250px", overflowY: "auto" }}>
        <Typography variant="h6" sx={{ fontWeight: 600, textAlign: "center", mb: 2, color: "#004d40" }}>
          Time Per Task ⏱️
        </Typography>
        <List sx={{ width: "100%" }}>
          {tasks.length > 0 ? (
            tasks.map((task, index) => {
              // Calculate total time for the task including subtasks
              const totalTaskTime =
                task.time +
                (task.subtasks.reduce(
                  (total, subtask) => total + subtask.time,
                  0
                ) || 0);

              const dailyTimes = Object.entries(studyHistory) // Convert studyHistory into an array of daily times for this task
                .map(([date, timeByTask]) => {
                  return {
                    date,
                    time: timeByTask[task.name] || 0, // Fetch task time from studyHistory
                  };
                })
                .filter((entry) => entry.time > 0); // Remove days with 0 study time

              {
                /* Render each task with its total time and daily breakdown */
              }
              return (
                <ListItem
                  key={index}
                  sx={{
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                    mb: 1,
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <ListItemText
                    primary={`${task.name} - ${formatTime(totalTaskTime)}`} // Task Name + Total Time
                    primaryTypographyProps={{ fontWeight: 500 }}
                    secondary={
                      dailyTimes.length > 0 ? (
                        <List sx={{ paddingLeft: 2 }}>
                          {dailyTimes.map(
                            (
                              entry,
                              i // Map through daily times for this task
                            ) => (
                              // Render each daily entry with date and time
                              <ListItem
                                key={i}
                                sx={{ paddingY: 0, paddingX: 0 }}
                              >
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {entry.date}: {formatTime(entry.time)}
                                </Typography>
                              </ListItem>
                            )
                          )}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No daily records available
                        </Typography>
                      )
                    }
                  />
                </ListItem>
              );
            })
          ) : (
            // If no tasks, show a message
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Get Started!
            </Typography>
          )}
        </List>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Bar Chart - Study Time Per Task */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          textAlign: "center",
          mt: 3,
          mb: 2,
          color: "#004d40",
        }}
      >
        Study Time Per Task 📊
      </Typography>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={taskChartData}
          // make the SVG’s background white & give it rounded corners
          style={{ backgroundColor: "#ffffff", borderRadius: 8 }}
          margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis
            label={{ value: "Minutes", angle: -90, position: "insideLeft" }}
          />
          <RechartsTooltip />
          <Bar dataKey="time" fill="#90caf9" barSize={40} />
        </BarChart>
      </ResponsiveContainer>

      {/* Line Chart - Study Trends */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          textAlign: "center",
          mt: 3,
          mb: 2,
          color: "#004d40",
        }}
      >
        Study Trends Over Time 📈
      </Typography>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={studyTrends}
          style={{ backgroundColor: "#ffffff", borderRadius: 8 }}
          margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            label={{ value: "Minutes", angle: -90, position: "insideLeft" }}
          />
          <RechartsTooltip />
          <Line
            type="monotone"
            dataKey="time"
            stroke="#f57c00"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
      <Button
        onClick={onClose}
        sx={{
          display: "block",
          mx: "auto",               
          backgroundColor: "#00796b",
          color: "#ffffff",
          mt: 3,
          px: 4,
          py: 1.5,
          borderRadius: 2,
        }}
      >
        Back 🔙
      </Button>
    </Box>
  );
}
