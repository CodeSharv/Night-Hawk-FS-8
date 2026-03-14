import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { firestore } from "../firebase";

// ============ USERS ============

export async function createUserProfile(uid, data) {
  await setDoc(doc(firestore, "users", uid), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return { id: uid, ...data };
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(firestore, "users", uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateUserProfile(uid, updates) {
  await updateDoc(doc(firestore, "users", uid), {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function getAllUsers() {
  const snap = await getDocs(collection(firestore, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteUser(uid) {
  await deleteDoc(doc(firestore, "users", uid));
}

// ============ EVENTS ============

export async function getEvents(categoryFilter) {
  const snap = await getDocs(collection(firestore, "events"));
  let events = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Filter by category client-side (avoids needing a Firestore composite index)
  if (categoryFilter && categoryFilter !== "All") {
    events = events.filter((e) => e.category === categoryFilter);
  }

  // Sort by date ascending
  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  return events;
}

export async function getEvent(eventId) {
  const snap = await getDoc(doc(firestore, "events", eventId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createEvent(data) {
  const docRef = await addDoc(collection(firestore, "events"), {
    ...data,
    rsvpCount: 0,
    createdAt: new Date().toISOString(),
  });
  return { id: docRef.id, ...data, rsvpCount: 0 };
}

export async function updateEvent(eventId, updates) {
  await updateDoc(doc(firestore, "events", eventId), {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteEvent(eventId) {
  // Delete related bookmarks
  const bSnap = await getDocs(
    query(collection(firestore, "bookmarks"), where("eventId", "==", eventId))
  );
  for (const d of bSnap.docs) await deleteDoc(d.ref);

  // Delete related registrations
  const rSnap = await getDocs(
    query(
      collection(firestore, "registrations"),
      where("eventId", "==", eventId)
    )
  );
  for (const d of rSnap.docs) await deleteDoc(d.ref);

  // Delete event
  await deleteDoc(doc(firestore, "events", eventId));
}

// ============ BOOKMARKS ============

export async function getBookmarks(userId) {
  const q = query(
    collection(firestore, "bookmarks"),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  const bookmarks = [];
  for (const d of snap.docs) {
    const bk = { id: d.id, ...d.data() };
    const eventSnap = await getDoc(doc(firestore, "events", bk.eventId));
    if (eventSnap.exists()) {
      bk.event = { id: eventSnap.id, ...eventSnap.data() };
    }
    bookmarks.push(bk);
  }
  return bookmarks;
}

export async function addBookmark(userId, eventId) {
  // Check duplicate
  const q = query(
    collection(firestore, "bookmarks"),
    where("userId", "==", userId),
    where("eventId", "==", eventId)
  );
  const existing = await getDocs(q);
  if (!existing.empty) throw new Error("Already bookmarked");

  const docRef = await addDoc(collection(firestore, "bookmarks"), {
    userId,
    eventId,
    createdAt: new Date().toISOString(),
  });
  return { id: docRef.id, userId, eventId };
}

export async function removeBookmark(userId, eventId) {
  const q = query(
    collection(firestore, "bookmarks"),
    where("userId", "==", userId),
    where("eventId", "==", eventId)
  );
  const snap = await getDocs(q);
  for (const d of snap.docs) await deleteDoc(d.ref);
}

// ============ REGISTRATIONS ============

export async function getRegistrations(userId) {
  const q = query(
    collection(firestore, "registrations"),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  const regs = [];
  for (const d of snap.docs) {
    const reg = { id: d.id, ...d.data() };
    const eventSnap = await getDoc(doc(firestore, "events", reg.eventId));
    if (eventSnap.exists()) {
      reg.event = { id: eventSnap.id, ...eventSnap.data() };
    }
    regs.push(reg);
  }
  return regs;
}

export async function getEventRegistrations(eventId) {
  const q = query(
    collection(firestore, "registrations"),
    where("eventId", "==", eventId)
  );
  const snap = await getDocs(q);
  const regs = [];
  for (const d of snap.docs) {
    const reg = { id: d.id, ...d.data() };
    const userSnap = await getDoc(doc(firestore, "users", reg.userId));
    if (userSnap.exists()) {
      reg.user = { id: userSnap.id, ...userSnap.data() };
    }
    regs.push(reg);
  }
  return regs;
}

export async function registerForEvent(userId, eventId) {
  // Check duplicate
  const q = query(
    collection(firestore, "registrations"),
    where("userId", "==", userId),
    where("eventId", "==", eventId)
  );
  const existing = await getDocs(q);
  if (!existing.empty) throw new Error("Already registered");

  const docRef = await addDoc(collection(firestore, "registrations"), {
    userId,
    eventId,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  });

  // Increment RSVP count
  await updateDoc(doc(firestore, "events", eventId), {
    rsvpCount: increment(1),
  });

  return { id: docRef.id, userId, eventId, status: "confirmed" };
}

export async function cancelRegistration(userId, eventId) {
  const q = query(
    collection(firestore, "registrations"),
    where("userId", "==", userId),
    where("eventId", "==", eventId)
  );
  const snap = await getDocs(q);
  for (const d of snap.docs) await deleteDoc(d.ref);

  // Decrement RSVP count
  await updateDoc(doc(firestore, "events", eventId), {
    rsvpCount: increment(-1),
  });
}
