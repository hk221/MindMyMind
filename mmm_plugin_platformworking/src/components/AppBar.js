import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

// This component renders the top app bar with the title "Mind My Mind"
// It uses Material-UI components for styling and layout
export default function Bar() {
  return (
    <React.Fragment>
      <AppBar position="static" sx={{ backgroundColor: "#088F8F" }}>
        <Toolbar>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "white" }}>
            Mind My Mind
          </Typography>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </React.Fragment>
  );
}