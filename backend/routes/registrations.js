const express = require("express");
const router = express.Router();
const { db, admin } = require("../firebaseConfig");
const { authenticate } = require("../middleware/auth");

// GET /api/registrations — List registrations
// ?userId=xxx or ?eventId=xxx
router.get("/", authenticate, async (req, res) => {
  try {
    const { eventId } = req.query;
    let query = db.collection("registrations");

    if (eventId) {
      // Organizer viewing registrations for their event
      query = query.where("eventId", "==", eventId);
    } else {
      // User viewing their own registrations
      query = query.where("userId", "==", req.user.uid);
    }

    const snapshot = await query.get();
    const registrations = [];

    for (const doc of snapshot.docs) {
      const reg = { id: doc.id, ...doc.data() };
      // Populate event data
      const eventDoc = await db.collection("events").doc(reg.eventId).get();
      if (eventDoc.exists) {
        reg.event = { id: eventDoc.id, ...eventDoc.data() };
      }
      // Populate user data
      const userDoc = await db.collection("users").doc(reg.userId).get();
      if (userDoc.exists) {
        reg.user = { id: userDoc.id, ...userDoc.data() };
      }
      registrations.push(reg);
    }

    res.json(registrations);
  } catch (err) {
    console.error("Error fetching registrations:", err);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

// POST /api/registrations — Register for an event
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

    // Check for duplicate registration
    const existing = await db
      .collection("registrations")
      .where("userId", "==", req.user.uid)
      .where("eventId", "==", eventId)
      .get();

    if (!existing.empty) {
      return res
        .status(409)
        .json({ error: "Already registered for this event" });
    }

    const registration = {
      userId: req.user.uid,
      eventId,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("registrations").add(registration);

    // Increment RSVP count on event
    await db
      .collection("events")
      .doc(eventId)
      .update({
        rsvpCount: admin.firestore.FieldValue.increment(1),
      });

    res.status(201).json({ id: docRef.id, ...registration });
  } catch (err) {
    console.error("Error creating registration:", err);
    res.status(500).json({ error: "Failed to register" });
  }
});

// DELETE /api/registrations/:eventId — Cancel registration by eventId
router.delete("/:eventId", authenticate, async (req, res) => {
  try {
    const snapshot = await db
      .collection("registrations")
      .where("userId", "==", req.user.uid)
      .where("eventId", "==", req.params.eventId)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Registration not found" });
    }

    const batch = db.batch();
    snapshot.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    // Decrement RSVP count
    await db
      .collection("events")
      .doc(req.params.eventId)
      .update({
        rsvpCount: admin.firestore.FieldValue.increment(-1),
      });

    res.json({ message: "Registration cancelled" });
  } catch (err) {
    console.error("Error cancelling registration:", err);
    res.status(500).json({ error: "Failed to cancel registration" });
  }
});

module.exports = router;
