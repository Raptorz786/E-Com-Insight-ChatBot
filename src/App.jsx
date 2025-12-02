import React, { useState, useEffect } from "react";
import Login from "./Login";
import ChatBot from "./ChatBot";
import Preloader from "./Preloader";
import "./App.css"; // make sure you have fade classes here

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fadeClass, setFadeClass] = useState("fade-in"); // 👈 controls fade animation

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    if (loggedIn === "true") setIsLoggedIn(true);
  }, []);

  const showPreloader = (callback) => {
    setFadeClass("fade-out"); // fade out login/chat first
    setTimeout(() => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setFadeClass("fade-in"); // fade in next screen
        callback();
      }, 3000); // ⏱ preloader duration
    }, 600); // ⏱ fade-out duration
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        showPreloader(() => {
          localStorage.setItem("isLoggedIn", "true");
          setIsLoggedIn(true);
        });
      } else {
        alert("Invalid email or password");
      }
    } catch (error) {
      console.error("❌ Login failed:", error);
      alert("Something went wrong. Please check your Flask server.");
    }
  };

  const handleLogout = () => {
    showPreloader(() => {
      localStorage.removeItem("isLoggedIn");
      setIsLoggedIn(false);
    });
  };

  return (
    <>
      {isLoading ? (
        <Preloader /> // 👈 fully visible — no opacity 0
      ) : (
        <div className={`fade-container ${fadeClass}`}>
          {isLoggedIn ? (
            <ChatBot onLogout={handleLogout} />
          ) : (
            <Login onLogin={handleLogin} />
          )}
        </div>
      )}\


      {/* <div>
        {isLoggedIn ? (
          <ChatBot onLogout={handleLogout} />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </div> */}
    </>
  );
}

export default App;
