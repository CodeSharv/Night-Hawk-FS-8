const admin = require("firebase-admin");
const path = require("path");
require("dotenv").config();

const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.join(__dirname, "serviceAccountKey.json");

let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (err) {
  console.error(
    "⚠️  Firebase service account key not found at:",
    serviceAccountPath
  );
  console.error(
    "   Download it from Firebase Console → Project Settings → Service Accounts"
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { admin, db };
