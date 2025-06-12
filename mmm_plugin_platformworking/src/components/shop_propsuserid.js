import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { firestore } from "./firebase"; 
import { doc, getDoc, updateDoc } from "firebase/firestore";
/**
 * @param {PluginProps} props
 */
// This component renders a shop interface where users can spend their coins.
export default function Shop(props) {
  const { open, onClose, getUser } = props; // Destructure props to get open state, onClose function, and getUser function
  const [coins, setCoins] = useState(null); // null to handle "No coins for you" fallback

  // useEffect to fetch coins when the shop is opened
  useEffect(() => {
    if (open) {
      const userId = String(getUser());
      // Check if userId is valid (i.e. not undefined, null, or empty)
      if (!userId || userId === "undefined" || userId === "null") {
        // If no valid user ID, fall back to default coins
        console.log("No valid user ID provided. Falling back to default coins.");
        const coinsDocRef = doc(firestore, "coins", "default");
        // Fetch default coins from Firestore
        getDoc(coinsDocRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              setCoins(docSnap.data().coins);
            } else {
              console.warn("No coins found for user. Falling back to default coins.");
              setCoins(0); // Fallback if no coins found in Firestore
            }
          })
          .catch((error) => {
            console.error("Error fetching coins:", error);
            setCoins(0); // Ensure fallback works
          });
      } else {
        // If valid user ID, fetch coins for that user
        const coinsDocRef = doc(firestore, "coins", userId);
        getDoc(coinsDocRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              setCoins(docSnap.data().coins);
            } else {
              console.warn("No coins found for user. Falling back to default coins.");
              setCoins(0); // Fallback if no coins found in Firestore
            }
          })
          .catch((error) => {
            console.error("Error fetching coins:", error);
            setCoins(0); // Ensure fallback works
          });
      }
    }
  }, [open, getUser]);

  // Function to spend coins
  const spendCoins = async (amount) => {
    try {
      const userId = props.getUser(); // Get the user ID from props
      const coinsDocRef = doc(firestore, "coins", userId); // Reference to the user's coins document
      const docSnap = await getDoc(coinsDocRef); // Fetch the document snapshot

      // Check if the document exists and has coins
      if (docSnap.exists()) {
        const currentCoins = docSnap.data().coins || 0;

        if (currentCoins >= amount) {
          await updateDoc(coinsDocRef, { coins: currentCoins - amount });
          setCoins(currentCoins - amount);
          alert(`You spent ${amount} coins! 🛍️`);
        } else {
          alert("Not enough coins!");
        }
      } else {
        alert("No coins found.");
      }
    } catch (error) {
      console.error("Error spending coins:", error);
    }
  };

  return open ? (
    // User interface for the shop
    // If the shop is open, render the shop UI
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "60vh",
        textAlign: "center",
        padding: 3,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
          borderRadius: "12px",
          maxWidth: "600px",
          height: "100%",
          textAlign: "center",
          background: "linear-gradient(135deg, #e0f7fa 0%, #e0f2f1 100%)",
        }}
      >
        {/* Shop title and coins display */}
        <Box>
          <Typography variant="h4" sx={{ marginBottom: 2 }}>
            Spend your Coins! 🛒
          </Typography>
          <Typography variant="h5">
            {coins > 0? (
              <>
                You have <strong>{coins}</strong> {coins === 1 ? "coin" : "coins"} 🪙
              </>
            ) : (
              <>
                No coins for you 😞
                Go complete a quiz to earn some! 🤑
              </>
            )}
          </Typography>
          <Button
            onClick={() => spendCoins(2)}
            disabled={coins === null || coins < 2}
            sx={{
              backgroundColor: "#f57c00",
              color: "white",
              marginTop: 2,
              "&:hover": { backgroundColor: "#e65100" },
              opacity: coins !== null && coins >= 2 ? 1 : 0.5,
            }}
          >
            Buy Item (2 Coins)
          </Button>
        </Box>
        <Button
          onClick={onClose}
          sx={{
            backgroundColor: "#088F8F",
            color: "white",
            width: "100%",
            padding: "12px",
            marginTop: "auto",
            "&:hover": { backgroundColor: "#06402B" },
          }}
        >
          Back to Tasks
        </Button>
      </Paper>
    </Box>
  ) : null;
}
