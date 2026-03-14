const express = require("express");
const router = express.Router();
const { db } = require("../firebaseConfig");
const { authenticate, requireRole } = require("../middleware/auth");

// GET /api/events — List all events (public, with optional category/search filter)
router.get("/", async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = db.collection("events");

    if (category && category !== "All") {
      query = query.where("category", "==", category);
    }

    const snapshot = await query.orderBy("date", "asc").get();
    let events = [];
    snapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });

    // Filter by search term (title or description)
    if (search) {
      const term = search.toLowerCase();
      events = events.filter(
        (e) =>
          e.title?.toLowerCase().includes(term) ||
          e.description?.toLowerCase().includes(term)
      );
    }

    // Sort by popularity (RSVP count)
    if (sort === "popular") {
      events.sort((a, b) => (b.rsvpCount || 0) - (a.rsvpCount || 0));
    }

    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// GET /api/events/:id — Get single event
router.get("/:id", async (req, res) => {
  try {
    const doc = await db.collection("events").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

// POST /api/events — Create event (organizer only)
router.post("/", authenticate, requireRole("organizer"), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      date,
      time,
      location,
      image,
    } = req.body;

    if (!title || !date || !time || !location || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const event = {
      title,
      description: description || "",
      category,
      date,
      time,
      location,
      image: image || "",
      organizerId: req.user.uid,
      organizerName: req.userProfile?.name || "Unknown Organizer",
      rsvpCount: 0,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("events").add(event);
    res.status(201).json({ id: docRef.id, ...event });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// PUT /api/events/:id — Update event (organizer who created it)
router.put("/:id", authenticate, requireRole("organizer"), async (req, res) => {
  try {
    const docRef = db.collection("events").doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (doc.data().organizerId !== req.user.uid) {
      return res
        .status(403)
        .json({ error: "You can only edit your own events" });
    }

    const updates = {};
    const allowed = [
      "title",
      "description",
      "category",
      "date",
      "time",
      "location",
      "image",
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    updates.updatedAt = new Date().toISOString();

    await docRef.update(updates);
    const updated = await docRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ error: "Failed to update event" });
  }
});

// DELETE /api/events/:id — Delete event (organizer who created it, or admin)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const docRef = db.collection("events").doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Event not found" });
    }

    const isOwner = doc.data().organizerId === req.user.uid;
    const isAdmin = req.userProfile?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Not authorized to delete" });
    }

    // Delete related bookmarks and registrations
    const batch = db.batch();
    const bookmarks = await db
      .collection("bookmarks")
      .where("eventId", "==", req.params.id)
      .get();
    bookmarks.forEach((b) => batch.delete(b.ref));

    const registrations = await db
      .collection("registrations")
      .where("eventId", "==", req.params.id)
      .get();
    registrations.forEach((r) => batch.delete(r.ref));

    batch.delete(docRef);
    await batch.commit();

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

module.exports = router;
