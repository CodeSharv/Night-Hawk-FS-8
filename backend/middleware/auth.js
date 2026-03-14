const { admin, db } = require("../firebaseConfig");

// Verify Firebase ID token from Authorization header
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;

    // Fetch user profile from Firestore
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    if (userDoc.exists) {
      req.userProfile = { id: userDoc.id, ...userDoc.data() };
    }
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Role-based access control
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.userProfile) {
      return res.status(403).json({ error: "User profile not found" });
    }
    if (!roles.includes(req.userProfile.role)) {
      return res
        .status(403)
        .json({ error: `Access denied. Required role: ${roles.join(" or ")}` });
    }
    next();
  };
};

module.exports = { authenticate, requireRole };
