import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [start, setStart] = useState("");
  const [tokens, setTokens] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenStr = params.get("token");
    if (tokenStr) {
      const tokenObj = JSON.parse(decodeURIComponent(tokenStr));
      localStorage.setItem("google_tokens", JSON.stringify(tokenObj));
      setTokens(tokenObj);

      window.history.replaceState(null, "", window.location.pathname);
    } else {
      const stored = localStorage.getItem("google_tokens");
      if (stored) setTokens(JSON.parse(stored));
    }
  }, []);

  const handleLogin = () => {
    window.location.href = "http://localhost:5000/login";
  };

  const handleLogout = () => {
    localStorage.removeItem("google_tokens");
    setTokens(null);
  };

  const handleAddEvent = async () => {
    if (!tokens) {
      alert("Please log in first.");
      return;
    }
  
    const event = {
      summary: title,
      description: desc,
      start: {
        dateTime: new Date(start).toISOString(),
        timeZone: "Asia/Kolkata",
      }
    };
  
    try {
      const response = await axios.post("http://localhost:5000/addevent", {
        tokens,
        event,
      });
  
      // Redirect the user to Google Calendar with the new event
      const googleCalendarUrl = response.data.googleCalendarUrl;
      window.location.href = googleCalendarUrl;
  
    } catch (err) {
      console.error(err);
      alert("Failed to add event");
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">
          Google Calendar Task
        </h1>

        {!tokens ? (
          <button
            className="w-full mb-6 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 cursor-pointer"
            onClick={handleLogin}
          >
            Login with Google
          </button>
        ) : (
          <button
            className="w-full mb-6 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}

        <input
          type="text"
          placeholder="Event Title"
          className="w-full p-2 mb-3 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          className="w-full p-2 mb-3 border rounded"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        ></textarea>
        <input
          type="datetime-local"
          className="w-full p-2 mb-3 border rounded"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        
        <button
          onClick={handleAddEvent}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          Add to Google Calendar
        </button>
      </div>
    </div>
  );
}

export default App;
