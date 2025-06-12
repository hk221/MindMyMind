import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { firestore, auth } from "./firebase";
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// This component renders a shop interface where users can spend their coins and view trophies.
export default function Shop({ open, onClose }) { 
  const [coins, setCoins] = useState(null); // null to handle "No coins for you" fallback
  const [user, setUser] = useState(null); // Current authenticated user
  const [showTrophies, setShowTrophies] = useState(false); // Toggle between shop and trophy cabinet
  const [trophies, setTrophies] = useState([]); // Array to hold trophy IDs

  // List of items available in the shop
  const items = [
    { id: "motivator", name: "Motivator Badge", cost: 3, emoji: "🚀" },
    { id: "zenMaster", name: "Zen Master", cost: 4, emoji: "🧘‍♂️🌸" },
    { id: "goldDuck", name: "Golden Duck Trophy", cost: 5, emoji: "🦆✨" },
    { id: "taskWizard", name: "Task Wizard", cost: 6, emoji: "🧙‍♂️📘" },
  ];

  // Function to fetch user data (coins and trophies) from Firestore
  const fetchUserData = async () => {
    if (!user) return;
    const rawUserId = user.uid; // Get the raw user ID from Firebase auth
    const coinsDocRef = doc(firestore, "coins", rawUserId); // Reference to the user's coins document
    const trophiesDocRef = doc(firestore, "trophies", rawUserId); // Reference to the user's trophies document
  
    // Fetch coins and trophies from Firestore
    try {
      const coinsSnap = await getDoc(coinsDocRef); // Get coins document snapshot
      setCoins(coinsSnap.exists() ? coinsSnap.data().coins : 0); // Set coins state, default to 0 if not found
      const trophiesSnap = await getDoc(trophiesDocRef); // Get trophies document snapshot
      setTrophies(trophiesSnap.exists() ? trophiesSnap.data().items || [] : []); // Set trophies state, default to empty array if not found
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  // Listen for authentication state changes to set the current user
  useEffect(() => {
    // This effect runs once when the component mounts and sets up an auth state listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // Fetch coins and trophies when the shop opens and user is authenticated
  useEffect(() => {
    if (open && user) {
      // Fetch coins
      fetchUserData();
    }
  }, [open, user]);

  // Function to spend coins and update trophies 
  const spendCoins = async (amount, itemId = null) => {
    if (!user) return;
    const rawUserId = user.uid;
    const coinsDocRef = doc(firestore, "coins", rawUserId);
    const trophiesDocRef = doc(firestore, "trophies", rawUserId);
  
    // Check if itemId is provided, if not, use a default value
    try {
      const docSnap = await getDoc(coinsDocRef);
      const currentCoins = docSnap.exists() ? docSnap.data().coins || 0 : 0;
  
      if (currentCoins >= amount) {
        await updateDoc(coinsDocRef, { coins: currentCoins - amount });
  
        const trophiesSnap = await getDoc(trophiesDocRef);
        if (!trophiesSnap.exists()) {
          // Create doc with initial item array
          await setDoc(trophiesDocRef, { items: [itemId] });
        } else {
          // Update existing doc
          await updateDoc(trophiesDocRef, { items: arrayUnion(itemId) });
        }
  
        setCoins(currentCoins - amount);
        setTrophies((prev) => [...prev, itemId]);
        alert(`You bought ${itemId} for ${amount} coins! 🎉`);
      } else {
        alert("Not enough coins!");
      }
    } catch (error) {
      console.error("Error spending coins:", error);
    }
  };

  // Function to get item details by ID
  const getItemDetails = (id) => items.find((item) => item.id === id);
  // If the shop is not open, return null to avoid rendering
  if (!open) return null;

  return (
    // Main container for the shop interface
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
        {/* Display shop title and coins*/}
        {!showTrophies ? (
          <>
            <Typography variant="h4" sx={{ marginBottom: 2, textAlign: "center" }}>
              Spend your Coins! 🛒
            </Typography>
            <Typography variant="h5" align="center">
              {coins > 0 ? (
                <>
                  You have <strong>{coins}</strong>{" "}
                  {coins === 1 ? "coin" : "coins"} 🪙
                </>
              ) : (
                <>
                  No coins for you 😞
                  <br />
                  Complete a quiz to earn some! 🤑
                </>
              )}
            </Typography>
            {/* Render items available for purchase */}
            <Box sx={{ marginTop: 3 }}>
              {items.map((item) => (
                <Paper
                    key={item.id}
                    elevation={3}
                    sx={{
                      marginBottom: 2,
                      padding: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "auto",
                      borderRadius: 2, // Rounded corners (8px)
                      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)", // Soft shadow
                      background: "#ffffff", // Optional: ensures consistent contrast
                    }}
                  >
                  <Typography variant="body1">
                    {item.emoji} {item.name} — {item.cost} coins
                  </Typography>
                  <Button
                    onClick={() => spendCoins(item.cost, item.id)}
                    disabled={coins === null || coins < item.cost}
                    sx={{
                      backgroundColor: "#f57c00",
                      color: "white",
                      "&:hover": { backgroundColor: "#e65100" },
                    }}
                  >
                    Buy
                  </Button>
                </Paper>
              ))}
            </Box>
          </>
        ) : (
          <>
            {/* Trophy cabinet section */}
            <Typography variant="h4" sx={{ marginBottom: 2 }}>
              Trophy Cabinet 🏆
            </Typography>
            {trophies.length > 0 ? (
              <Box sx={{ marginTop: 2 }}>
                {trophies.map((id) => {
                  const item = getItemDetails(id);
                  return (
                    <Paper
                      key={id}
                      elevation={2}
                      sx={{
                        marginBottom: 2,
                        padding: 2,
                        width: "90%",
                        textAlign: "left",
                      }}
                    >
                      <Typography variant="h6">
                        {item?.emoji || "🎖️"} {item?.name || id}
                      </Typography>
                    </Paper>
                  );
                })}
              </Box>
            ) : (
              <Typography variant="body1">
                No trophies yet. Earn some by completing tasks! 🎯
              </Typography>
            )}
          </>
        )}
        {/* Buttons to toggle between shop and trophy cabinet, refresh coins, and go back */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, width: "100%", alignItems: "center", marginTop: 2 }}>
      <Button
        onClick={() => setShowTrophies((prev) => !prev)}
        sx={{
          backgroundColor: "#00796b",
          color: "#ffffff",
          fontWeight: 600,
          px: 4,
          py: 1.5,
          borderRadius: 2,
          textTransform: "none",
          width: "70%",
          "&:hover": {
            backgroundColor: "#00695c",
          },
        }}
      >
        {showTrophies ? "Back to Shop 🛍️" : "Trophy Cabinet 🏆"}
      </Button>

      <Button
        onClick={fetchUserData}
        sx={{
          backgroundColor: "#00796b",
          color: "#ffffff",
          fontWeight: 600,
          px: 4,
          py: 1.5,
          borderRadius: 2,
          textTransform: "none",
          width: "70%",
          "&:hover": {
            backgroundColor: "#00695c",
          },
        }}
      >
        🔄 Refresh Coins
      </Button>

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
          Back to tasks ⏮️
        </Button>
      </Box>
    </Box>
  );
}