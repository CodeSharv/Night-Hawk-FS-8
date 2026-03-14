const express = require("express");
const router = express.Router();
const { db } = require("../firebaseConfig");
const { authenticate, requireRole } = require("../middleware/auth");

// POST /api/users — Create/store user profile after signup
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, role } = req.body;

    if (!name || !role) {
      return res.status(400).json({ error: "Name and role are required" });
    }

    if (!["student", "organizer", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const userData = {
      name,
      email: req.user.email,
      role,
      createdAt: new Date().toISOString(),
    };

    await db.collection("users").doc(req.user.uid).set(userData);
    res.status(201).json({ id: req.user.uid, ...userData });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// GET /api/users/me — Get current user profile
router.get("/me", authenticate, async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.user.uid).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "User profile not found" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// GET /api/users/:id — Get user by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// GET /api/users — List all users (admin only)
router.get("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = [];
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// PUT /api/users/:id — Update user profile
router.put("/:id", authenticate, async (req, res) => {
  try {
    if (req.user.uid !== req.params.id && req.userProfile?.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updates = {};
    const allowed = ["name"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (req.userProfile?.role === "admin" && req.body.role) {
      updates.role = req.body.role;
    }

    updates.updatedAt = new Date().toISOString();

    await db.collection("users").doc(req.params.id).update(updates);
    const updated = await db.collection("users").doc(req.params.id).get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE /api/users/:id — Delete user (admin only)
router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  async (req, res) => {
    try {
      await db.collection("users").doc(req.params.id).delete();
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
);

module.exports = router;
