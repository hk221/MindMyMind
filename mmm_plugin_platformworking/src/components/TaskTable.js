import React, { useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  IconButton,
  Collapse,
  TextField,
} from "@mui/material";
import StandaloneToggleButton from "./TickButton";
import {
  Alarm as AlarmIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";

// --- 1) Helper to format time into HH:MM:SS ---
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours ? `${hours}:` : ""}${minutes < 10 ? "0" : ""}${minutes}:${
    secs < 10 ? "0" : ""
  }${secs}`;
};

// --- 2) Subcomponent for a single Subtask row ---
function SubtaskRow({
  subtask,
  itemId,
  deleteMode,
  editingSubtask,
  editedSubtaskName,
  setEditedSubtaskName,
  toggleSubtaskCompletion,
  handleSaveSubtask,
  handleEditSubtask,
  startSubtaskTimer,
  deleteSubtask,
}) {
  const isEditingThis =
    editingSubtask?.taskId === itemId && editingSubtask?.subtaskId === subtask.id;

  return (
    <TableRow>
      {/* Subtask Name + Toggle */}
      <TableCell align="left" sx={{ whiteSpace: "normal", wordWrap: "break-word" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <StandaloneToggleButton
            selected={subtask.completed}
            onChange={() => toggleSubtaskCompletion(itemId, subtask.id)}
          />
          {isEditingThis ? (
            <TextField
              value={editedSubtaskName}
              onChange={(e) => setEditedSubtaskName(e.target.value)}
              size="small"
              fullWidth
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveSubtask(itemId, subtask);
              }}
              sx={{ ml: 1 }}
            />
          ) : (
            <Typography variant="body1" sx={{ ml: 1 }}>
              {subtask.name}
            </Typography>
          )}
        </Box>
      </TableCell>

      {/* Time */}
      <TableCell align="center">
        <Typography variant="body2" color="text.secondary">
          {formatTime(subtask.time)}
        </Typography>
      </TableCell>

      {/* Actions */}
      <TableCell align="center">
        {!deleteMode ? (
          <>
            {isEditingThis ? (
              <IconButton onClick={() => handleSaveSubtask(itemId, subtask)}>
                <SaveIcon sx={{ fontSize: 24 }} />
              </IconButton>
            ) : (
              <IconButton onClick={() => handleEditSubtask(itemId, subtask)}>
                <EditIcon sx={{ fontSize: 24 }} />
              </IconButton>
            )}
            <IconButton onClick={() => startSubtaskTimer(itemId, subtask.id)}>
              <AlarmIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </>
        ) : (
          <IconButton
            sx={{
              backgroundColor: "#ffebee",
              color: "#d32f2f",
              "&:hover": { backgroundColor: "#ffcdd2" },
            }}
            aria-label="delete subtask"
            onClick={() => deleteSubtask(itemId, subtask.id)}
          >
            <DeleteIcon sx={{ fontSize: 24 }} />
          </IconButton>
        )}
      </TableCell>
    </TableRow>
  );
}

// --- 3) Subcomponent that displays the entire Subtask section (expanded area) ---
function SubtaskSection({
  item,
  expandedTask,
  deleteMode,
  subtaskInput,
  setSubtaskInput,
  addSubtask,
  editingSubtask,
  setEditingSubtask,
  editedSubtaskName,
  setEditedSubtaskName,
  updateSubtask,
  deleteSubtask,
  toggleSubtaskCompletion,
  startSubtaskTimer,
}) {
  // Local helpers for subtask editing
  const handleEditSubtask = (taskId, subtask) => {
    setEditingSubtask({ taskId, subtaskId: subtask.id });
    setEditedSubtaskName(subtask.name);
  };
  const handleSaveSubtask = (taskId, subtask) => {
    updateSubtask(taskId, subtask.id, editedSubtaskName);
    setEditingSubtask(null);
  };
  const handleAddSubtask = (taskId) => {
    if (subtaskInput.trim()) {
      addSubtask(taskId, subtaskInput.trim());
      setSubtaskInput("");
    }
  };

  return (
    <TableRow>
      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
        <Collapse in={expandedTask === item.id} timeout="auto" unmountOnExit>
          <Box sx={{ margin: 1, borderLeft: "2px solid #088F8F", pl: 2 }}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold", fontSize: "1.1rem", color: "#00796b" }}
            >
              Subtasks
            </Typography>
            <Table size="small" aria-label="subtasks">
              <TableHead>
                <TableRow>
                  <TableCell align="left">Subtask</TableCell>
                  <TableCell align="center">Time</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {item.subtasks?.length ? (
                  item.subtasks.map((subtask) => (
                    <SubtaskRow
                      key={subtask.id}
                      subtask={subtask}
                      itemId={item.id}
                      deleteMode={deleteMode}
                      editingSubtask={editingSubtask}
                      editedSubtaskName={editedSubtaskName}
                      setEditedSubtaskName={setEditedSubtaskName}
                      toggleSubtaskCompletion={toggleSubtaskCompletion}
                      handleSaveSubtask={handleSaveSubtask}
                      handleEditSubtask={handleEditSubtask}
                      startSubtaskTimer={startSubtaskTimer}
                      deleteSubtask={deleteSubtask}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography variant="body2" color="text.secondary">
                        No subtasks added.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {/* Row for adding a new subtask */}
                <TableRow>
                  <TableCell colSpan={3}>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <TextField
                        value={subtaskInput}
                        onChange={(e) => setSubtaskInput(e.target.value)}
                        size="small"
                        placeholder="New subtask"
                        fullWidth
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddSubtask(item.id);
                        }}
                      />
                      <IconButton onClick={() => handleAddSubtask(item.id)}>
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );
}

// --- 4) Subcomponent for the main Task row (non-expanded part) ---
function TaskRow({
  item,
  editTaskId,
  editedTaskName,
  setEditedTaskName,
  expandedTask,
  deleteMode,
  deleteItem,
  startTimer,
  toggleExpand,
  handleEditClick,
  handleSaveClick,
  updateTask,
}) {
  return (
    <TableRow role="checkbox">
      {/* Task name + Toggle */}
      <TableCell align="left" sx={{ whiteSpace: "normal", wordWrap: "break-word" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <StandaloneToggleButton
            selected={item.completed}
            onChange={() =>
              updateTask(item.id, { ...item, completed: !item.completed })
            }
          />
          {editTaskId === item.id ? (
            <TextField
              autoFocus
              value={editedTaskName}
              onChange={(e) => setEditedTaskName(e.target.value)}
              size="small"
              fullWidth
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveClick(item);
              }}
              sx={{ ml: 1 }}
            />
          ) : (
            <Typography
              sx={{ ml: 1, fontSize: "1rem", fontWeight: 500, cursor: "pointer" }}
              onClick={() => toggleExpand(item.id)}
            >
              {item.name}
            </Typography>
          )}
        </Box>
      </TableCell>

      {/* Total Time */}
      <TableCell align="center">
        <Typography sx={{ fontSize: "1rem", fontWeight: 500, color: "#004d40" }}>
          {formatTime(
            item.time + (item.subtasks?.reduce((sum, s) => sum + s.time, 0) || 0)
          )}
        </Typography>
      </TableCell>

      {/* Actions */}
      <TableCell align="center">
        {!deleteMode ? (
          <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
            {editTaskId === item.id ? (
              <IconButton onClick={() => handleSaveClick(item)}>
                <SaveIcon sx={{ fontSize: 36 }} />
              </IconButton>
            ) : (
              <IconButton onClick={() => handleEditClick(item)}>
                <EditIcon sx={{ fontSize: 36 }} />
              </IconButton>
            )}
            <IconButton onClick={() => startTimer(item.id)}>
              <AlarmIcon sx={{ fontSize: 36 }} />
            </IconButton>
            <IconButton onClick={() => toggleExpand(item.id)}>
              {expandedTask === item.id ? (
                <ExpandLessIcon sx={{ fontSize: 36 }} />
              ) : (
                <ExpandMoreIcon sx={{ fontSize: 36 }} />
              )}
            </IconButton>
          </Box>
        ) : (
          <IconButton
            sx={{
              backgroundColor: "#ffebee",
              color: "#d32f2f",
              "&:hover": { backgroundColor: "#ffcdd2" },
              transition: "0.3s ease",
              padding: "10px",
            }}
            aria-label="delete task"
            onClick={() => deleteItem(item.id)}
          >
            <DeleteIcon sx={{ fontSize: 36 }} />
          </IconButton>
        )}
      </TableCell>
    </TableRow>
  );
}

// --- 5) Main component that stitches everything together ---
export default function TaskTable({
  items,
  deleteMode,
  deleteItem,
  startTimer,
  updateTask,
  addSubtask,
  startSubtaskTimer,
  updateSubtask,
  deleteSubtask,
  toggleTaskCompletion,
  toggleSubtaskCompletion,
}) {
  const [editTaskId, setEditTaskId] = useState(null);
  const [editedTaskName, setEditedTaskName] = useState("");
  const [expandedTask, setExpandedTask] = useState(null);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [editedSubtaskName, setEditedSubtaskName] = useState("");

  // Handlers for editing main tasks
  const handleEditClick = (task) => {
    setEditTaskId(task.id);
    setEditedTaskName(task.name || "");
  };
  const handleSaveClick = (task) => {
    const updatedTask = { ...task, name: editedTaskName };
    updateTask(task.id, updatedTask);
    setEditTaskId(null);
  };

  // Expand/collapse
  const toggleExpand = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  return (
    <Paper
      sx={{
        width: "100%",
        borderRadius: "12px",
        boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.1)",
        background: "linear-gradient(135deg, #ffffff, #f5f5f5)",
        overflow: "hidden" // Ensures the inner table is clipped to the rounded corners
      }}
    >
      <TableContainer sx={{ maxHeight: 440, overflowY: "auto" }}>
        <Table
          stickyHeader
          aria-label="task table"
          sx={{
            borderCollapse: "collapse",
            "& .MuiTableCell-root": {
              borderBottom: "1px solid #ccc",
            },
          }}
        >
          {/* ---- Header ---- */}
          <TableHead>
            <TableRow>
              <TableCell
                align="center"
                sx={{
                  width: "40%",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  color: "#00796b",
                }}
              >
                Tasks
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  width: "20%",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  color: "#00796b",
                }}
              >
                Total Time
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  width: "40%",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  color: "#00796b",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          {/* ---- Body ---- */}
          <TableBody>
            {items.map((item) => (
              <React.Fragment key={item.id}>
                {/* Main row */}
                <TaskRow
                  item={item}
                  editTaskId={editTaskId}
                  editedTaskName={editedTaskName}
                  setEditedTaskName={setEditedTaskName}
                  expandedTask={expandedTask}
                  deleteMode={deleteMode}
                  deleteItem={deleteItem}
                  startTimer={startTimer}
                  toggleExpand={toggleExpand}
                  handleEditClick={handleEditClick}
                  handleSaveClick={handleSaveClick}
                  updateTask={updateTask}
                />

                {/* Subtasks section */}
                <SubtaskSection
                  item={item}
                  expandedTask={expandedTask}
                  deleteMode={deleteMode}
                  subtaskInput={subtaskInput}
                  setSubtaskInput={setSubtaskInput}
                  addSubtask={addSubtask}
                  editingSubtask={editingSubtask}
                  setEditingSubtask={setEditingSubtask}
                  editedSubtaskName={editedSubtaskName}
                  setEditedSubtaskName={setEditedSubtaskName}
                  updateSubtask={updateSubtask}
                  deleteSubtask={deleteSubtask}
                  toggleSubtaskCompletion={toggleSubtaskCompletion}
                  startSubtaskTimer={startSubtaskTimer}
                />
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}