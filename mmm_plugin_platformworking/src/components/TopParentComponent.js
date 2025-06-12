// Main task management interface and logic
import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Divider, Tooltip } from "@mui/material";
import TaskTable from "./TaskTable";
import Timer from "./timer";
import StatisticsDialog from "./StatisticsDialog";
import Shop from "./Shop";
import AddText from "./Enter_Text";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import StudyMethod from "./StudyMethod";
import MotivationPage from "./motivation";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import AppBar from "./AppBar";
import { useAuth } from "./AuthContext";
import { getDatabase, ref, onValue, set } from "firebase/database"; 
import stringSimilarity from "string-similarity"; 

// Main component for managing tasks, subtasks, and various UI states
// It handles task creation, deletion, timer management, statistics, and more.
// It strings together various components like TaskTable, Timer, StatisticsDialog, Shop, and MotivationPage (al the children components).
// It also integrates with Firebase Realtime Database for voice command handling and persistent state management using localStorage.
export default function List() {
  const { user } = useAuth(); // Get the logged-in user
  // Task state, loaded from localStorage on first render
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("taskItems");
    return saved ? JSON.parse(saved) : [{ id: 1, name: "Get Started!", time: 0, subtasks: [] }];
  });

  // Save task items to localStorage whenever they change
  // This ensures that tasks persist across page reloads.
  useEffect(() => {
    localStorage.setItem("taskItems", JSON.stringify(items));
  }, [items]);

  // UI state toggles
  const [deleteMode, setDeleteMode] = useState(false); // Toggle for delete mode
  const [timerActive, setTimerActive] = useState(false); // Toggle for the timer
  const [currentTaskId, setCurrentTaskId] = useState(null); // ID of the currently active task or subtask
  const [statisticsActive, setStatisticsActive] = useState(false); // Toggle for statistics dialog
  const [shopActive, setShopActive] = useState(false); // Toggle for shop dialog
  const [bookActive, setBookActive] = useState(false); // Toggle for study methods dialog
  const [motivationActive, setMotivationActive] = useState(false); // Toggle for motivation page
  const [isShopOpen, setIsShopOpen] = useState(true); // State to control shop dialog visibility

  // Tracking breaks and history across sessions
  const [breaksTaken, setBreaksTaken] = useState(() => {
    const saved = localStorage.getItem("breaksTaken");
    return saved ? JSON.parse(saved) : 0;
  });

  // Study history is stored in a structured format by date and task name
  const [studyHistory, setStudyHistory] = useState(() => {
    const saved = localStorage.getItem("studyHistory");
    return saved ? JSON.parse(saved) : {};
  });

  // Save breaks taken and study history to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("breaksTaken", JSON.stringify(breaksTaken));
  }, [breaksTaken]);

  // Save study history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("studyHistory", JSON.stringify(studyHistory));
  }, [studyHistory]);

  // Create a new task 
  const addItem = (newItem) => {
    setItems((prev) => [...prev, { id: Date.now(), name: newItem, time: 0, subtasks: [] }]);
  };

  // Delete task or subtask
  const deleteItem = (id) => setItems((prev) => prev.filter((item) => item.id !== id));
  const deleteSubtask = (taskId, subtaskId) => {
    setItems((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, subtasks: task.subtasks.filter((s) => s.id !== subtaskId) }
          : task
      )
    );
  };

  // Toggle delete mode
  const toggleDeleteMode = () => setDeleteMode((prev) => !prev);

  // Start timer handlers for tasks and subtasks
  const startTimer = (taskId) => {
    setCurrentTaskId(taskId);
    setTimerActive(true);
    setStatisticsActive(false);
    setShopActive(false);
  };

  // Start timer for a specific subtask
  const startSubtaskTimer = (taskId, subtaskId) => {
    setCurrentTaskId({ taskId, subtaskId });
    setTimerActive(true);
  };

  // Task/subtask editing logic
  const updateTask = (taskId, updatedTask) => {
    setItems((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updatedTask } : t)));
  };

  // Update subtask name
  const updateSubTask = (taskId, subtaskId, newName) => {
    setItems((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map((s) => (s.id === subtaskId ? { ...s, name: newName } : s)),
            }
          : task
      )
    );
  };

  // Add a new subtask to a task
  const addSubtask = (taskId, name) => {
    const newSubtask = { id: Date.now(), name, time: 0 };
    setItems((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, subtasks: [...task.subtasks, newSubtask] } : task))
    );
  };

  // Handle timer completion for tasks and subtasks
  const handleTimerEnd = (timeElapsed, newBreaks, completed) => {
    setTimerActive(false); // Stop the timer
    setBreaksTaken(newBreaks); // Update breaks taken
    setCurrentTaskId(null); // Reset current task ID

    // Update study history with the completed task/subtask
    const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
    setStudyHistory((prev) => ({
      ...prev,
      [today]: {
        ...(prev[today] || {}),
        [completed.name]: (prev[today]?.[completed.name] || 0) + timeElapsed,
      },
    }));

    // Update the task or subtask time
    if (completed.taskId) {
      // If it's a subtask, find the parent task and update the subtask time
      setItems((prev) =>
        prev.map((task) =>
          task.id === completed.taskId
            ? {
                ...task,
                // Update the subtask time
                subtasks: task.subtasks.map((s) =>
                  s.id === completed.id ? { ...s, time: s.time + timeElapsed } : s
                ),
              }
            : task
        )
      );
    } else {
      setItems((prev) =>
        // If it's a main task, update the task time directly
        prev.map((t) => (t.id === completed.id ? { ...t, time: t.time + timeElapsed } : t))
      );
    }
  };

  // Mark task/subtask complete
  const toggleTaskCompletion = (taskId) => {
    setItems((prev) =>
      // Toggle completion status of the task
      prev.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    );
  };

  // Toggle subtask completion
  const toggleSubtaskCompletion = (taskId, subId) => {
    setItems((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map((s) =>
                // Toggle completion status of the subtask
                s.id === subId ? { ...s, completed: !s.completed } : s
              ),
            }
          : task
      )
    );
  };

  // Manual time adjustment
  const handleTimeAdjust = (delta, adjustedTask) => {
    if (delta === 0) return;

    // Adjust time for the task or subtask
    const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });

    // Update study history with the time adjustment
    setStudyHistory((prev) => ({
      ...prev,
      [today]: {
        ...(prev[today] || {}),
        [adjustedTask.name]: Math.max(0, (prev[today]?.[adjustedTask.name] || 0) + delta),
      },
    }));

    // Update the task or subtask time
    setItems((prev) =>
      // If it's a subtask, find the parent task and update the subtask time
      prev.map((item) =>
        item.id === adjustedTask.id ? { ...item, time: Math.max(0, item.time + delta) } : item
      )
    );
  };

  // Calculate total time studied across all tasks and subtasks
  const getTotalTimeStudied = () => {
    return items.reduce((total, task) => {
      // Sum up the time for the main task and all its subtasks
      const subtaskTime = task.subtasks.reduce((subTotal, sub) => subTotal + sub.time, 0);
      return total + task.time + subtaskTime;
    }, 0);
  };

  // Effect to listen for voice commands from Firebase Realtime Database
  // Fuzzy logic is used to match spoken commands to task names eg. "start maths homework" → "Maths HW"
  useEffect(() => {
    const db = getDatabase(); // Initialize Firebase Realtime Database
    const commandRef = ref(db, "/voiceCommand"); // Reference to the voice command node in the database
  
    // Listen for changes to the voice command node
    const unsubscribe = onValue(commandRef, (snapshot) => {
      const voiceCommand = snapshot.val();
      if (!voiceCommand) return;
  
      const lower = voiceCommand.toLowerCase().trim();
      console.log("Voice command received:", lower);
  
      // === Keyword sets ===
      const statsKeywords = ["statistics", "stats"];
      const shopKeywords = ["shop", "coins", "spend"];
      const methodKeywords = ["study methods", "methods", "learning advice"];
      const motivationKeywords = ["motivation", "motivational", "motivational boost", "inner voice", "motivate"];
      const backKeywords = ["go back", "home", "exit", "close", "back"];
      const navVerbs = ["go", "open", "show", "navigate", "access"];
  
      // Keywords for task management commands
      const matchesKeyword = (command, keywords) =>
        keywords.some((kw) => command.includes(kw));
  
      // Check if command matches navigation verbs and keywords
      const matchesNavigation = (command, keywords) =>
        navVerbs.some((v) => command.includes(v)) &&
        keywords.some((kw) => command.includes(kw));
  
      // === Start task or subtask ===
      const subtaskMatch = lower.match(/^(start|begin|resume|go|play)\s+(.+)\s+under\s+(.+)$/i);
      const taskOnlyMatch = lower.match(/^(start|begin|resume|go|play)\s+(.+)$/i);
  
      // Check if the command is to start a subtask or a task
      if (subtaskMatch) {
        const subtaskSpoken = subtaskMatch[2].trim(); // The spoken subtask name
        const taskSpoken = subtaskMatch[3].trim(); // The spoken parent task name
        const taskNames = items.map((t) => t.name.toLowerCase()); // List of all task names in lowercase
        const taskResult = stringSimilarity.findBestMatch(taskSpoken, taskNames); // Fuzzy match the spoken task name against all task names
        const parentTask = items[taskResult.bestMatchIndex]; // Get the parent task based on the best match index
  
        // If a matching parent task is found and it has subtasks
        if (taskResult.bestMatch.rating > 0.5 && parentTask.subtasks.length > 0) {
          const subtaskNames = parentTask.subtasks.map((s) => s.name.toLowerCase());
          const subtaskResult = stringSimilarity.findBestMatch(subtaskSpoken, subtaskNames);
          const matchedSubtask = parentTask.subtasks[subtaskResult.bestMatchIndex];
  
          // If a matching subtask is found, start its timer
          if (subtaskResult.bestMatch.rating > 0.5) {
            console.log(`Starting subtask: "${matchedSubtask.name}" under "${parentTask.name}"`);
            startSubtaskTimer(parentTask.id, matchedSubtask.id);
          } else {
            console.warn(`Subtask "${subtaskSpoken}" not found under "${parentTask.name}"`);
          }
        } else {
          console.warn(`No matching parent task found for: "${taskSpoken}"`);
        }
      } 
      // If the command is to start a task only (not a subtask)
      else if (taskOnlyMatch) {
        const spokenTaskName = taskOnlyMatch[2].trim();
        const lowerCommand = spokenTaskName.toLowerCase();
      
        // 1) Try a direct substring match against any task name
        const direct = items.find(
          (t) => lowerCommand.includes(t.name.toLowerCase())
        );
        if (direct) {
          console.log(`Direct match starting task "${direct.name}"`);
          return startTimer(direct.id);
        }
      
        // 2) Fallback to fuzzy matching
        const taskNames = items.map((t) => t.name.toLowerCase());
        const { bestMatch, bestMatchIndex } =
        stringSimilarity.findBestMatch(lowerCommand, taskNames);
        
        // If a fuzzy match is found with a sufficient rating
        if (bestMatch.rating > 0.3) {
          const matchedTask = items[bestMatchIndex]; // Get the matched task based on the best match index
          console.log(`Fuzzy match starting task "${matchedTask.name}"`);
          startTimer(matchedTask.id); 
        } else {
          console.warn(`No matching task found for: "${spokenTaskName}"`);
        }
      }
  
      // === Add/Delete task/subtask ===
      const addTaskMatch = lower.match(/^add\s+(.+)$/i);
      const deleteTaskMatch = lower.match(/^delete\s+(.+)$/i);
      const addSubtaskMatch = lower.match(/^add\s+(.+)\s+under\s+(.+)$/i);
      const deleteSubtaskMatch = lower.match(/^delete\s+(.+)\s+under\s+(.+)$/i);
  
      // Check if the command is to add or delete a task or subtask
      if (addTaskMatch) {
        const newTaskName = addTaskMatch[1].trim();
        console.log(`Adding task: "${newTaskName}"`);
        addItem(newTaskName);
      } else if (deleteTaskMatch) {
        const deleteTaskName = deleteTaskMatch[1].trim();
        const taskNames = items.map((t) => t.name.toLowerCase());
        const { bestMatchIndex, bestMatch } = stringSimilarity.findBestMatch(deleteTaskName, taskNames);
        const matchedTask = items[bestMatchIndex];
        if (bestMatch.rating > 0.5) {
          console.log(`Deleting task: "${matchedTask.name}"`);
          deleteItem(matchedTask.id);
        } else {
          console.warn(`Task not found for deletion: "${deleteTaskName}"`);
        }
      } else if (addSubtaskMatch) {
        const subtaskName = addSubtaskMatch[1].trim();
        const parentName = addSubtaskMatch[2].trim();
        const taskNames = items.map((t) => t.name.toLowerCase());
        const { bestMatchIndex, bestMatch } = stringSimilarity.findBestMatch(parentName, taskNames);
        const parentTask = items[bestMatchIndex];
        if (bestMatch.rating > 0.5) {
          console.log(`Adding subtask "${subtaskName}" under "${parentTask.name}"`);
          addSubtask(parentTask.id, subtaskName);
        } else {
          console.warn(`Parent task not found for subtask add: "${parentName}"`);
        }
      } else if (deleteSubtaskMatch) {
        const subName = deleteSubtaskMatch[1].trim();
        const taskName = deleteSubtaskMatch[2].trim();
  
        const taskNames = items.map((t) => t.name.toLowerCase());
        const { bestMatchIndex: taskIdx, bestMatch: taskMatch } = stringSimilarity.findBestMatch(taskName, taskNames);
        const parentTask = items[taskIdx];
  
        if (taskMatch.rating > 0.5 && parentTask.subtasks.length > 0) {
          const subNames = parentTask.subtasks.map((s) => s.name.toLowerCase());
          const { bestMatchIndex: subIdx, bestMatch: subMatch } = stringSimilarity.findBestMatch(subName, subNames);
          const matchedSub = parentTask.subtasks[subIdx];
  
          if (subMatch.rating > 0.5) {
            console.log(`Deleting subtask "${matchedSub.name}" under "${parentTask.name}"`);
            deleteSubtask(parentTask.id, matchedSub.id);
          } else {
            console.warn(`Subtask not found for deletion: "${subName}"`);
          }
        } else {
          console.warn(`Parent task not found for subtask delete: "${taskName}"`);
        }
      }
  
      // === Navigation commands ===
      if (matchesNavigation(lower, statsKeywords)) {
        console.log("Opening Statistics Dialog via voice");
        setStatisticsActive(true);
        setTimerActive(false);
        setShopActive(false);
        setBookActive(false);
        setMotivationActive(false);
      } else if (matchesNavigation(lower, shopKeywords)) {
        console.log("Opening Shop via voice");
        setShopActive(true);
        setIsShopOpen(true);
        setTimerActive(false);
        setStatisticsActive(false);
        setBookActive(false);
        setMotivationActive(false);
      } else if (matchesNavigation(lower, methodKeywords)) {
        console.log("Opening Study Methods via voice");
        setBookActive(true);
        setShopActive(false);
        setTimerActive(false);
        setStatisticsActive(false);
        setMotivationActive(false);
      } else if (matchesNavigation(lower, motivationKeywords)) {
        console.log("Opening Motivation Page via voice");
        setMotivationActive(true);
        setBookActive(false);
        setShopActive(false);
        setStatisticsActive(false);
        setTimerActive(false);
      } else if (matchesKeyword(lower, backKeywords)) {
        console.log("Going back via voice");
        setShopActive(false);
        setStatisticsActive(false);
        setBookActive(false);
        setMotivationActive(false);
        setTimerActive(false);
      }
  
      // === Reset command ===
      set(ref(db, "/voiceCommand"), null);
    });
  
    return () => unsubscribe();
  }, [items, startTimer, startSubtaskTimer, addItem, deleteItem, addSubtask, deleteSubtask]);

  // Trigger Motivation page
  const handleTriggerMotivation = () => {
    setTimerActive(false); // force exit timer
    setMotivationActive(true); // open motivation
  };

  // UI Rendering Logic
  return (
    <>
    {/* Render different components based on the active state
    This includes the Timer, StatisticsDialog, Shop, StudyMethod, MotivationPage, and the main task management interface.
    Each component is conditionally rendered based on the current state flags.
    The main task management interface includes the AppBar, AddText input, TaskTable, and action buttons. */}
      {timerActive && currentTaskId !== null ? (
        <Timer
          onTimerEnd={handleTimerEnd}
          initialBreaks={breaksTaken}
          onTimeAdjust={handleTimeAdjust}
          currentTask={
            typeof currentTaskId === "object"
              ? items.find((t) => t.id === currentTaskId.taskId)
              : items.find((t) => t.id === currentTaskId)
          }
          currentSubtask={
            typeof currentTaskId === "object"
              ? items
                  .find((t) => t.id === currentTaskId.taskId)
                  .subtasks.find((s) => s.id === currentTaskId.subtaskId)
              : null
          }
          onTriggerMotivation={handleTriggerMotivation}
        />
      ) : statisticsActive ? (
        <StatisticsDialog
          open={true}
          onClose={() => setStatisticsActive(false)}
          totalTimeStudied={getTotalTimeStudied()}
          breaksTaken={breaksTaken}
          tasks={items}
          studyHistory={studyHistory}
        />
      ) : shopActive ? (
        <Shop
          open={isShopOpen}
          onClose={() => {
            setIsShopOpen(false);
            setShopActive(false);
          }}
        />
      ) : bookActive ? (
        <StudyMethod
          open={true}
          onClose={() => setBookActive(false)}
          totalTimeStudied={getTotalTimeStudied()}
          breaksTaken={breaksTaken}
          tasks={items}
          onSubmit={() => {}}
        />
      ) : motivationActive ? (
        <MotivationPage onClose={() => setMotivationActive(false)} addItem={addItem} />
      ) : (
        <Box sx={{ width: "80%", maxWidth: "1400px", margin: "20px auto", padding: 4, background: "linear-gradient(135deg, #e0f7fa 0%, #e0f2f1 100%)", borderRadius: "12px", boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.1)" }}>
          <AppBar />

          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3, color: "#088F8F" }}>
              Task Manager
            </Typography>
          </Box>

          <AddText addItem={addItem} />
          <Divider sx={{ marginY: 2 }} />

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "110%", mx: "auto", ml: "-5%" }}>
            <TaskTable
              items={items}
              deleteMode={deleteMode}
              deleteItem={deleteItem}
              deleteSubtask={deleteSubtask}
              startTimer={startTimer}
              updateTask={updateTask}
              addSubtask={addSubtask}
              startSubtaskTimer={startSubtaskTimer}
              updateSubtask={updateSubTask}
              toggleTaskCompletion={toggleTaskCompletion}
              toggleSubtaskCompletion={toggleSubtaskCompletion}
            />
          </Box>

          <Box sx={{ textAlign: "center", marginTop: 3, display: "flex", justifyContent: "center", gap: 2 }}>
            {/* Action Buttons */}
            <Tooltip title="View Study Statistics">
              <IconButton sx={{ backgroundColor: "#90caf9", color: "#FFFFFF", "&:hover": { backgroundColor: "#64b5f6" } }} onClick={() => { setStatisticsActive(true); setTimerActive(false); setShopActive(false); }}>
                <BarChartIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Spend Coins in Shop">
              <IconButton onClick={() => { setShopActive(true); setIsShopOpen(true); setTimerActive(false); setStatisticsActive(false); }} sx={{ backgroundColor: "#088F8F", color: "#FFFFFF", padding: "8px", "&:hover": { backgroundColor: "#06402B" } }}>
                <ShoppingCartIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Study Methods">
              <IconButton onClick={() => { setBookActive(true); setShopActive(false); setTimerActive(false); setStatisticsActive(false); }} sx={{ backgroundColor: "#CE93D8", color: "#FFFFFF", padding: "8px", "&:hover": { backgroundColor: "#bc5090" } }}>
                <LibraryBooksIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Motivational Boost">
              <IconButton sx={{ backgroundColor: "#e5c185", color: "#FFFFFF", "&:hover": { backgroundColor: "#deae9f" } }} onClick={() => setMotivationActive(true)}>
                <SelfImprovementIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={deleteMode ? "Exit Delete Mode" : "Enable Delete Mode"}>
              <IconButton onClick={toggleDeleteMode} sx={{ backgroundColor: deleteMode ? "#76C76B" : "#F08080", color: "#FFFFFF", "&:hover": { backgroundColor: deleteMode ? "#5BA157" : "#DC6B6B" } }}>
                {deleteMode ? <DoneIcon /> : <DeleteIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}
    </>
  );
}