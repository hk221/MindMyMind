let lastSentCommand = "";
let lastSentTime = 0;

import React from "react";
import CheckIcon from "@mui/icons-material/Check";
import ToggleButton from "@mui/material/ToggleButton";
import { getDatabase, ref, set } from "firebase/database";

// This component renders a standalone toggle button that sends a command to the Firebase Realtime Database when toggled on.
export default function StandaloneToggleButton({ selected, onChange }) {
  // selected: boolean indicating if the button is currently selected
  // onChange: function to call when the button state changes
  // It sends a command to the Firebase Realtime Database when toggled on, ensuring that the command is not sent too frequently.
  const sendCommand = (command) => {
    const now = Date.now();
    if (command === lastSentCommand && now - lastSentTime < 1000) return;

    lastSentCommand = command;
    lastSentTime = now;

    const db = getDatabase();
    set(ref(db, "/webCommand"), command);
  };

  // handleToggle: function to handle the toggle button state change
  // It sends a command when toggling from off to on, and calls the onChange function provided by the parent component.
  const handleToggle = (event, newSelected) => {
    // Only send command if toggling from off → on
    if (!selected && newSelected) {
      sendCommand("TASK CHECKED OFF, well done mate!");
    }
    onChange(event, newSelected);
  };

  // Render the toggle button with custom styles and icon
  return (
    <ToggleButton
      value="check"
      selected={selected}
      onChange={handleToggle}
      sx={{
        width: 30,
        height: 30,
        borderRadius: "75%",
        "&.Mui-selected": {
          backgroundColor: "#088F8F",
          "&:hover": {
            backgroundColor: "#088F8F",
          },
        },
      }}
    >
      <CheckIcon
        fontSize="small"
        sx={{
          color: selected ? "#ffffff" : "#088F8F",
        }}
      />
    </ToggleButton>
  );
}