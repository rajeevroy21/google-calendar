const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { google } = require("googleapis");

dotenv.config();

const app = express();
app.use(cors());

app.use(cors({
  origin: 'http://localhost:5173',
}));
app.use(express.json());

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

console.log("CLIENT_ID:", process.env.CLIENT_ID);
console.log("CLIENT_SECRET:", process.env.CLIENT_SECRET);
console.log("REDIRECT_URI:", process.env.REDIRECT_URI);

app.get("/login", (req, res) => {
  const scopes = ["https://www.googleapis.com/auth/calendar"];
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  res.redirect(url);
});

app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  res.redirect(`${process.env.FRONTEND_URI}/?token=${encodeURIComponent(JSON.stringify(tokens))}`);
});

app.post("/addevent", async (req, res) => {
  const { tokens, event } = req.body;
  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  // If no end time is provided, set the event duration to 1 hour.
  if (!event.end) {
    const startTime = new Date(event.start.dateTime);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later
    event.end = {
      dateTime: endTime.toISOString(),
      timeZone: "Asia/Kolkata", // same timezone as the start
    };
  }

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.summary)}&details=${encodeURIComponent(event.description)}&dates=${encodeURIComponent(new Date(event.start.dateTime).toISOString().replace(/-|:|\.\d+/g, ""))}`;

    res.status(200).json({ message: "Event added to calendar!", googleCalendarUrl });
  } catch (err) {
    res.status(500).send("Error adding event: " + err.message);
  }
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
