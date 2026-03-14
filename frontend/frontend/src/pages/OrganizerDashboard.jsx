import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventRegistrations,
} from "../services/firestore";

const categories = ["Tech", "Sports", "Cultural", "Workshops", "Seminars"];

export default function OrganizerDashboard() {
  const { currentUser, userProfile } = useAuth();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [rsvpData, setRsvpData] = useState({});
  const [activeView, setActiveView] = useState("dashboard");

  const [form, setForm] = useState({
    title: "", description: "", category: "Tech", date: "", time: "", location: "", image: "",
  });

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/create")) {
      setActiveView("create");
      setShowCreateModal(true);
    } else if (path.includes("/manage")) setActiveView("manage");
    else if (path.includes("/rsvps")) setActiveView("rsvps");
    else setActiveView("dashboard");
  }, [location]);

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    setLoading(true);
    try {
      const data = await getEvents();
      const myEvents = data.filter((e) => e.organizerId === currentUser?.uid);
      setEvents(myEvents);

      const rsvps = {};
      for (const evt of myEvents) {
        try {
          rsvps[evt.id] = await getEventRegistrations(evt.id);
        } catch { rsvps[evt.id] = []; }
      }
      setRsvpData(rsvps);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function handleCreateEvent(e) {
    e.preventDefault();
    try {
      await createEvent({
        ...form,
        organizerId: currentUser.uid,
        organizerName: userProfile?.name || "Unknown Organizer",
      });
      toast.success("Event created!");
      setForm({ title: "", description: "", category: "Tech", date: "", time: "", location: "", image: "" });
      setShowCreateModal(false);
      loadEvents();
    } catch (err) {
      toast.error(err.message || "Failed to create");
    }
  }

  async function handleUpdateEvent(e) {
    e.preventDefault();
    try {
      await updateEvent(editingEvent.id, form);
      toast.success("Event updated!");
      setEditingEvent(null);
      loadEvents();
    } catch { toast.error("Failed to update event"); }
  }

  async function handleDelete(eventId) {
    if (!confirm("Delete this event?")) return;
    try {
      await deleteEvent(eventId);
      toast.success("Event deleted");
      loadEvents();
    } catch { toast.error("Failed to delete"); }
  }

  function startEdit(evt) {
    setForm({
      title: evt.title, description: evt.description, category: evt.category,
      date: evt.date, time: evt.time, location: evt.location, image: evt.image || "",
    });
    setEditingEvent(evt);
  }

  const totalRsvps = Object.values(rsvpData).reduce((s, arr) => s + arr.length, 0);

  const renderEventForm = (onSubmit, submitLabel) => (
    <form onSubmit={onSubmit} className="event-form">
      <div className="form-row">
        <div className="form-group">
          <label>Event Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Event name" />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
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
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
        <button type="button" className="btn btn-outline" onClick={() => { setShowCreateModal(false); setEditingEvent(null); }}>Cancel</button>
      </div>
    </form>
  );

  return (
    <DashboardLayout role="organizer">
      <div className="dashboard-content" id="organizer-dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Organizer Dashboard</h1>
            <p className="subtitle">Manage your campus events</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setShowCreateModal(true); setForm({ title: "", description: "", category: "Tech", date: "", time: "", location: "", image: "" }); }}>
            <HiOutlinePlus /> Create Event
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card"><span className="stat-number">{events.length}</span><span className="stat-label">Total Events</span></div>
          <div className="stat-card"><span className="stat-number">{totalRsvps}</span><span className="stat-label">Total RSVPs</span></div>
          <div className="stat-card"><span className="stat-number">{events.filter((e) => new Date(e.date) >= new Date()).length}</span><span className="stat-label">Upcoming</span></div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Create New Event</h2>
              {renderEventForm(handleCreateEvent, "Create Event")}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingEvent && (
          <div className="modal-overlay" onClick={() => setEditingEvent(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Edit Event</h2>
              {renderEventForm(handleUpdateEvent, "Save Changes")}
            </div>
          </div>
        )}

        {/* Events Table */}
        {loading ? (
          <div className="loading-state"><div className="spinner"></div></div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>No events yet</h3>
            <p>Click &quot;Create Event&quot; above to get started!</p>
          </div>
        ) : (
          <div className="events-table-wrap">
            <table className="events-table">
              <thead>
                <tr><th>Event</th><th>Category</th><th>Date</th><th>Location</th><th>RSVPs</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {events.map((evt) => (
                  <tr key={evt.id}>
                    <td className="event-name-cell">{evt.title}</td>
                    <td><span className="table-badge">{evt.category}</span></td>
                    <td>{new Date(evt.date).toLocaleDateString()}</td>
                    <td>{evt.location}</td>
                    <td>{rsvpData[evt.id]?.length || 0}</td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/events/${evt.id}`} className="action-btn" title="View"><HiOutlineEye /></Link>
                        <button className="action-btn" onClick={() => startEdit(evt)} title="Edit"><HiOutlinePencil /></button>
                        <button className="action-btn danger" onClick={() => handleDelete(evt.id)} title="Delete"><HiOutlineTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* RSVP Section - always show if there are events with RSVPs */}
        {Object.values(rsvpData).some(arr => arr.length > 0) && (
          <div className="rsvp-section">
            <h2>RSVP Tracking</h2>
            {events.map((evt) => (
              rsvpData[evt.id]?.length > 0 && (
                <div key={evt.id} className="rsvp-group">
                  <h3>{evt.title} ({rsvpData[evt.id].length} RSVPs)</h3>
                  <div className="rsvp-list">
                    {rsvpData[evt.id].map((reg) => (
                      <div key={reg.id} className="rsvp-item">
                        <span>{reg.user?.name || "Anonymous"}</span>
                        <span className="rsvp-email">{reg.user?.email || ""}</span>
                        <span className="rsvp-status">{reg.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
