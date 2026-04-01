const express = require("express");
const { google } = require("googleapis");
const oauth2Client = require("../utils/googleAuth");
const { requireAuth } = require("../utils/auth");

const router = express.Router();

router.post("/create", requireAuth, async (req, res) => {
  try {
    if (!req.user.googleRefreshToken) {
      return res.status(400).json({
        error: "google_not_connected",
      });
    }

    oauth2Client.setCredentials({
      refresh_token: req.user.googleRefreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: {
        summary: req.body.summary || "Tokun Meeting",
        start: { dateTime: new Date().toISOString() },
        end: { dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString() },
        conferenceData: {
          createRequest: {
            requestId: Date.now().toString(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      },
    });

    return res.json({
      meetLink: event.data.hangoutLink,
    });
  } catch (e) {
    console.error("Meet error", e);
    res.status(500).json({ error: "meet_failed" });
  }
});

module.exports = router;
