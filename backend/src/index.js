// Core-modules and third-party modules
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Config
dotenv.config();

// Sanity Client
import { client as sanityClient } from "./services/sanityClient.js";
import { createEvent } from "./services/sanityClient.js";

// Database Setup
import { Client } from "pg";

// App Instances and Middleware
const app = express();
const port = process.env.PORT || 8080;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.static("public"));

const client = new Client({
  connectionString: process.env.PGURI,
  ssl: {
    rejectUnauthorized: false,
  },
});

client
  .connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Database connection error:", err));

// Routes
app.post("/api/bookings", async (request, response) => {
  const { event_id, full_name, email, phone, notes } = request.body;

  try {
    if (!full_name || !email) {
      return response.status(400).json({
        error: "Full name and email are required",
      });
    }

    await client.query(
      "INSERT INTO bookings (event_id, full_name, email, phone, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [event_id, full_name, email, phone, notes]
    );

    response.status(201).json({ message: "Booking created successfully" });
  } catch (error) {
    console.error("Error creating booking:", error);
    response.status(500).json({
      error: "Failed to create booking",
    });
  }
});

app.post("/api/waitlist", async (request, response) => {
  const { event_id, full_name, email } = request.body;

  try {
    if (!full_name || !email) {
      return response.status(400).json({
        error: "Full name and email are required",
      });
    }

    await client.query(
      "INSERT INTO waitlist (event_id, full_name, email) VALUES ($1, $2, $3) RETURNING *",
      [event_id, full_name, email]
    );

    response
      .status(201)
      .json({ message: "Waitlist entry created successfully" });
  } catch (error) {
    console.error("Error creating waitlist entry:", error);
    response.status(500).json({
      error: "Failed to join waitlist",
    });
  }
});

app.post("/api/events", async (request, response) => {
  const {
    title,
    slug,
    eventDateTime,
    location,
    category,
    price,
    maxParticipants,
    description,
    whatToBring,
    eventImageFile,
    hostName,
    hostBio,
    hostAvatar,
  } = request.body;

  try {
    if (!title || !eventDateTime || !location || !category || !hostName) {
      return response.status(400).json({
        error: "Required fields missing",
      });
    }

    const eventData = {
      title,
      slug,
      eventDateTime,
      location,
      category,
      price,
      maxParticipants,
      description,
      whatToBring,
      eventImageFile,
      hostName,
      hostBio,
      hostAvatar,
    };

    await createEvent(eventData);

    response.status(201).json({ message: "Event created successfully" });
  } catch (error) {
    console.error("Error creating event:", error);
    response.status(500).json({
      error: "Failed to create event",
    });
  }
});

app.get("/api/events/:eventId/available-spots", async (request, response) => {
  const { eventId } = request.params;

  try {
    const event = await sanityClient.fetch(
      `*[_type == "event" && _id == $eventId][0]{
        maxParticipants
      }`,
      { eventId }
    );

    if (!event) {
      return response.status(404).json({ error: "Event not found" });
    }

    const bookingCountResult = await client.query(
      "SELECT COUNT(*) as booking_count FROM bookings WHERE event_id = $1",
      [eventId]
    );

    const bookingCount = Number(bookingCountResult.rows[0].booking_count);
    const spotsLeft = event.maxParticipants - bookingCount;

    response.status(200).json({ spotsLeft });
  } catch (error) {
    console.error("Error fetching available spots:", error);
    response.status(500).json({
      error: "Failed to fetch available spots",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
