import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import EventCard from "../components/EventCard";
import toast from "react-hot-toast";
import { HiOutlineSearch, HiOutlinePlus } from "react-icons/hi";
import {
  getEvents,
  getBookmarks,
  getRegistrations,
  addBookmark,
  removeBookmark,
  registerForEvent,
  createEvent,
} from "../services/firestore";

const categories = ["All", "Tech", "Sports", "Cultural", "Workshops", "Seminars"];
const eventCategories = ["Tech", "Sports", "Cultural", "Workshops", "Seminars"];

export default function StudentDashboard() {
  const { currentUser, userProfile } = useAuth();
  const [events, setEvents] = useState([]);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [registrations, setRegistrations] = useState(new Set());
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "Tech", date: "", time: "", location: "", image: "",
  });

  useEffect(() => {
    loadData();
  }, [activeCategory]);

  async function loadData() {
    setLoading(true);
    try {
      const eventsData = await getEvents(activeCategory);
      setEvents(eventsData);

      if (currentUser) {
        const [bData, rData] = await Promise.all([
          getBookmarks(currentUser.uid),
          getRegistrations(currentUser.uid),
        ]);
        setBookmarks(new Set(bData.map((b) => b.eventId)));
        setRegistrations(new Set(rData.map((r) => r.eventId)));
      }
    } catch (err) {
      console.error("Error loading data:", err);
    }
    setLoading(false);
  }

  async function handleBookmark(eventId) {
    try {
      if (bookmarks.has(eventId)) {
        await removeBookmark(currentUser.uid, eventId);
        setBookmarks((prev) => {
          const n = new Set(prev);
          n.delete(eventId);
          return n;
        });
        toast.success("Bookmark removed");
      } else {
        await addBookmark(currentUser.uid, eventId);
        setBookmarks((prev) => new Set(prev).add(eventId));
        toast.success("Event bookmarked!");
      }
    } catch {
      toast.error("Failed to update bookmark");
    }
  }

  async function handleRegister(eventId) {
    if (registrations.has(eventId)) return;
    try {
      await registerForEvent(currentUser.uid, eventId);
      setRegistrations((prev) => new Set(prev).add(eventId));
      toast.success("Successfully registered!");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    }
  }

  async function handleCreateEvent(e) {
    e.preventDefault();
    try {
      await createEvent({
        ...form,
        organizerId: currentUser.uid,
        organizerName: userProfile?.name || "Unknown",
      });
      toast.success("Event created successfully!");
      setForm({ title: "", description: "", category: "Tech", date: "", time: "", location: "", image: "" });
      setShowCreateModal(false);
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to create event");
    }
  }

  const filtered = events.filter(
    (e) =>
      e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="student">
      <div className="dashboard-content" id="student-dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back{userProfile ? `, ${userProfile.name}` : ""}!</h1>
            <p className="subtitle">Discover what&apos;s happening on campus</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setShowCreateModal(true); setForm({ title: "", description: "", category: "Tech", date: "", time: "", location: "", image: "" }); }}>
            <HiOutlinePlus /> Create Event
          </button>
        </div>

        <div className="search-bar">
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="event-search"
          />
        </div>

        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-tab ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Create Event Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Create New Event</h2>
              <form onSubmit={handleCreateEvent} className="event-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Event Title</label>
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Event name" />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {eventCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Describe your event..." />
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
                  <div className="form-group"><label>Time</label><input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required /></div>
                </div>
                <div className="form-group"><label>Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required placeholder="Building, Room, etc." /></div>
                <div className="form-group"><label>Image URL (optional)</label><input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." /></div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Create Event</button>
                  <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading events...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No events found</h3>
            <p>Try a different category or create your own event!</p>
          </div>
        ) : (
          <div className="events-grid">
            {filtered.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isBookmarked={bookmarks.has(event.id)}
                isRegistered={registrations.has(event.id)}
                onBookmark={handleBookmark}
                onRegister={handleRegister}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
