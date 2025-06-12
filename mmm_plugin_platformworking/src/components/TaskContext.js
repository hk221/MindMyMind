import React, { createContext, useContext, useState } from "react";

// This file defines a context for managing tasks in a React application.
// It provides a context that can be used to access the list of tasks and a function to mark tasks as complete.
// Define the type of the context value
const TaskContext = createContext({
  tasks: [],
  markTaskComplete: (index) => {}, // Default noop function
});

// Create a provider component
export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]); // Initialize tasks state

  // Function to mark a task as complete by its index
  const markTaskComplete = (index) => {
    setTasks((prevTasks) =>
      prevTasks.map((task, idx) =>
        idx === index ? { ...task, completed: true } : task
      )
    );
  };

  return (
    // Provide the tasks and the function to mark a task as complete
    <TaskContext.Provider value={{ tasks, markTaskComplete }}>
      {children}
    </TaskContext.Provider>
  );
};

// Create a custom hook to use the context
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};