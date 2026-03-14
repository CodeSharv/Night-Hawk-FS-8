const express = require("express");
const router = express.Router();
const { db } = require("../firebaseConfig");
const { authenticate } = require("../middleware/auth");

// GET /api/bookmarks — List bookmarks for current user
router.get("/", authenticate, async (req, res) => {
  try {
    const snapshot = await db
      .collection("bookmarks")
      .where("userId", "==", req.user.uid)
      .get();

    const bookmarks = [];
    for (const doc of snapshot.docs) {
      const bookmark = { id: doc.id, ...doc.data() };
      // Fetch associated event data
      const eventDoc = await db
        .collection("events")
        .doc(bookmark.eventId)
        .get();
      if (eventDoc.exists) {
        bookmark.event = { id: eventDoc.id, ...eventDoc.data() };
      }
      bookmarks.push(bookmark);
    }

    res.json(bookmarks);
  } catch (err) {
    console.error("Error fetching bookmarks:", err);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

// POST /api/bookmarks — Add a bookmark
router.post("/", authenticate, async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }

    // Check if event exists
    const eventDoc = await db.collection("events").doc(eventId).get();
    if (!eventDoc.exists) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check for duplicate
    const existing = await db
      .collection("bookmarks")
      .where("userId", "==", req.user.uid)
      .where("eventId", "==", eventId)
      .get();

    if (!existing.empty) {
      return res.status(409).json({ error: "Event already bookmarked" });
    }

    const bookmark = {
      userId: req.user.uid,
      eventId,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("bookmarks").add(bookmark);
    res.status(201).json({ id: docRef.id, ...bookmark });
  } catch (err) {
    console.error("Error creating bookmark:", err);
    res.status(500).json({ error: "Failed to create bookmark" });
  }
});

// DELETE /api/bookmarks/:eventId — Remove a bookmark by eventId
router.delete("/:eventId", authenticate, async (req, res) => {
  try {
    const snapshot = await db
      .collection("bookmarks")
      .where("userId", "==", req.user.uid)
      .where("eventId", "==", req.params.eventId)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Bookmark not found" });
    }

    const batch = db.batch();
    snapshot.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    res.json({ message: "Bookmark removed" });
  } catch (err) {
    console.error("Error deleting bookmark:", err);
    res.status(500).json({ error: "Failed to delete bookmark" });
  }
});

module.exports = router;
