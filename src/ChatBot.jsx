import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

function ChatBot({ onLogout }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatContainerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [choices, setChoices] = useState([]);

  // Capitalize first letter helper
  const capitalizeFirst = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // Auto-Scroll Behaviour
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const nearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 50;
      setAutoScroll(nearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to bottom when new message appears
  useEffect(() => {
    if (autoScroll && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, autoScroll]);

  // Handle user sending a message
  const sendMessage = async () => {
    if (input.trim() === "") return;

    const capitalizedInput = capitalizeFirst(input.trim());
    const userMsg = { sender: "User", text: capitalizedInput };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setChoices([]);

    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: capitalizedInput }),
      });

      const data = await response.json();
      const botMsg = { sender: "Bot", text: capitalizeFirst(data.response) };
      setMessages((prev) => [...prev, botMsg]);

      // if backend sends options (follow-ups or cross-questions)
      if (data.options && data.options.length > 0) {
        const questions = data.options.map((opt) => opt.question);
        setChoices(questions);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "Bot", text: "⚠️ Error: Unable to connect to server." },
      ]);
    }
  };

  // ✅ Handle user clicking an option (auto-send)
  const handleChoiceClick = async (choice) => {
    const capitalizedChoice = capitalizeFirst(choice.trim());
    const userMsg = { sender: "User", text: capitalizedChoice };
    setMessages((prev) => [...prev, userMsg]);
    setChoices([]);

    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: capitalizedChoice }),
      });

      const data = await response.json();
      const botMsg = { sender: "Bot", text: capitalizeFirst(data.response) };
      setMessages((prev) => [...prev, botMsg]);

      // handle follow-ups
      if (data.options && data.options.length > 0) {
        const questions = data.options.map((opt) => opt.question);
        setChoices(questions);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "Bot", text: "⚠️ Error: Unable to connect to server." },
      ]);
    }
  };

  return (
    <section className="ChatSection">
      <div className="ChatInner">
        <div className="BtnEnd">
          <button
            className="Btn"
            onClick={() => {
              localStorage.removeItem("isLoggedIn");
              onLogout();
            }}
          >
            <div className="sign">
              <svg viewBox="0 0 512 512">
                <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
              </svg>
            </div>
            <div className="text">Logout</div>
          </button>
        </div>

        <h2 className="ChatHead2">Chat With E-Com Insight</h2>

        {/* CHAT CONTAINER */}
        <div className="Chat" ref={chatContainerRef}>
          {messages.map((msg, i) => (
            <div key={i} className={msg.sender === "User" ? "Flexed1" : "Flexed2"}>
              {msg.sender === "Bot" ? (
                <div className="Flexed">
                  <p className="MessageText">{capitalizeFirst(msg.text)}</p>
                  <span className="UserRnd">
                    <svg
                      fill="#8C00FF"
                      xmlns="http://www.w3.org/2000/svg"
                      width="50"
                      height="50"
                      viewBox="0 0 100 100"
                      xmlSpace="preserve"
                    >
                      <path d="M49.6,25.8c7.2,0,13,5.8,13,13v3.3c-4.3-0.5-8.7-0.7-13-0.7c-4.3,0-8.7,0.2-13,0.7v-3.3 C36.6,31.7,42.4,25.8,49.6,25.8z"></path>
                      <path d="M73.2,63.8l1.3-11.4c2.9,0.5,5.1,2.9,5.1,5.6C79.6,61.2,76.7,63.8,73.2,63.8z"></path>
                      <path d="M25.9,63.8c-3.5,0-6.4-2.6-6.4-5.8c0-2.8,2.2-5.1,5.1-5.6L25.9,63.8z"></path>
                      <path d="M68.7,44.9c-6.6-0.7-12.9-1-19-1c-6.1,0-12.5,0.3-19,1h0c-2.2,0.2-3.8,2.2-3.5,4.3l2,19.4 c0.2,1.8,1.6,3.3,3.5,3.5c5.6,0.7,11.3,1,17.1,1s11.5-0.3,17.1-1c1.8-0.2,3.3-1.7,3.5-3.5l2-19.4v0C72.4,47,70.9,45.1,68.7,44.9z M38.6,62.5c-1.6,0-2.8-1.6-2.8-3.7s1.3-3.7,2.8-3.7s2.8,1.6,2.8,3.7S40.2,62.5,38.6,62.5z M55.3,66.6c0,0.2-0.1,0.4-0.2,0.5 c-0.1,0.1-0.3,0.2-0.5,0.2h-9.9c-0.2,0-0.4-0.1-0.5-0.2c-0.1-0.1-0.2-0.3-0.2-0.5v-1.8c0-0.4,0.3-0.7,0.7-0.7h0.2 c0.4,0,0.7,0.3,0.7,0.7v0.9h8.1v-0.9c0-0.4,0.3-0.7,0.7-0.7h0.2c0.4,0,0.7,0.3,0.7,0.7V66.6z M60.6,62.5c-1.6,0-2.8-1.6-2.8-3.7 s1.3-3.7,2.8-3.7s2.8,1.6,2.8,3.7S62.2,62.5,60.6,62.5z"></path>
                    </svg>
                  </span>
                </div>
              ) : (
                <>
                  <p className="MessageText">{capitalizeFirst(msg.text)}</p>
                  <span className="UserRnd">
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      stroke="#ffffff"
                    >
                      <circle opacity="0.5" cx="12" cy="9" r="3" stroke="#ffffff" strokeWidth="1.2"></circle>
                      <circle cx="12" cy="12" r="10" stroke="#ffffff" strokeWidth="1.2"></circle>
                      <path
                        opacity="0.5"
                        d="M17.9691 20C17.81 17.1085 16.9247 15 11.9999 15C7.07521 15 6.18991 17.1085 6.03076 20"
                        stroke="#ffffff"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      ></path>
                    </svg>
                  </span>
                </>
              )}

              {/* ✅ Keep your working list UI */}
              {msg.sender === "Bot" && i === messages.length - 1 && choices.length > 0 && (
                <ul>
                  {choices.map((choice, index) => (
                    <li key={index} onClick={() => handleChoiceClick(choice)} className="MessageText">
                      {choice}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="Flexed">
          <input
            value={capitalizeFirst(input)}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type message..."
            className="SendMessage"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button onClick={sendMessage} className="SendBtn">
            Send
          </button>
        </div>
      </div>
    </section>
  );
}

export default ChatBot;
