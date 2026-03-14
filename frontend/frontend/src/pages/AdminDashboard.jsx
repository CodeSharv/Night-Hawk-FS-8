import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import toast from "react-hot-toast";
import { HiOutlineTrash, HiOutlineEye } from "react-icons/hi";
import { Link } from "react-router-dom";
import { getEvents, deleteEvent, getAllUsers, deleteUser } from "../services/firestore";

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [eventsData, usersData] = await Promise.all([
        getEvents(),
        getAllUsers(),
      ]);
      setEvents(eventsData);
      setUsers(usersData);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function handleDeleteEvent(id) {
    if (!confirm("Delete this event?")) return;
    try {
      await deleteEvent(id);
      toast.success("Event deleted");
      loadData();
    } catch { toast.error("Failed to delete"); }
  }

  async function handleDeleteUser(id) {
    if (!confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      toast.success("User deleted");
      loadData();
    } catch { toast.error("Failed to delete"); }
  }

  const studentCount = users.filter((u) => u.role === "student").length;
  const organizerCount = users.filter((u) => u.role === "organizer").length;

  return (
    <DashboardLayout role="admin">
      <div className="dashboard-content" id="admin-dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="subtitle">Monitor and manage the platform</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><span className="stat-number">{users.length}</span><span className="stat-label">Total Users</span></div>
          <div className="stat-card"><span className="stat-number">{events.length}</span><span className="stat-label">Total Events</span></div>
          <div className="stat-card"><span className="stat-number">{studentCount}</span><span className="stat-label">Students</span></div>
          <div className="stat-card"><span className="stat-number">{organizerCount}</span><span className="stat-label">Organizers</span></div>
        </div>

        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>Overview</button>
          <button className={`tab-btn ${activeTab === "events" ? "active" : ""}`} onClick={() => setActiveTab("events")}>All Events</button>
          <button className={`tab-btn ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>All Users</button>
        </div>

        {loading ? (
          <div className="loading-state"><div className="spinner"></div></div>
        ) : (
          <>
            {activeTab === "events" && (
              <div className="events-table-wrap">
                <table className="events-table">
                  <thead><tr><th>Event</th><th>Organizer</th><th>Category</th><th>Date</th><th>RSVPs</th><th>Actions</th></tr></thead>
                  <tbody>
                    {events.map((evt) => (
                      <tr key={evt.id}>
                        <td className="event-name-cell">{evt.title}</td>
                        <td>{evt.organizerName || "Unknown"}</td>
                        <td><span className="table-badge">{evt.category}</span></td>
                        <td>{new Date(evt.date).toLocaleDateString()}</td>
                        <td>{evt.rsvpCount || 0}</td>
                        <td>
                          <div className="table-actions">
                            <Link to={`/events/${evt.id}`} className="action-btn"><HiOutlineEye /></Link>
                            <button className="action-btn danger" onClick={() => handleDeleteEvent(evt.id)}><HiOutlineTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "users" && (
              <div className="events-table-wrap">
                <table className="events-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td><span className={`table-badge badge-${user.role}`}>{user.role}</span></td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="table-actions">
                            <button className="action-btn danger" onClick={() => handleDeleteUser(user.id)}><HiOutlineTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "overview" && (
              <div className="admin-overview">
                <div className="overview-section">
                  <h3>Recent Events</h3>
                  {events.length === 0 ? <p style={{color:'var(--text-tertiary)', fontSize:'0.9rem'}}>No events yet</p> : (
                    <div className="overview-list">
                      {events.slice(0, 5).map((evt) => (
                        <div key={evt.id} className="overview-item">
                          <span className="overview-title">{evt.title}</span>
                          <span className="overview-meta">{evt.category} • {new Date(evt.date).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="overview-section">
                  <h3>Recent Users</h3>
                  {users.length === 0 ? <p style={{color:'var(--text-tertiary)', fontSize:'0.9rem'}}>No users yet</p> : (
                    <div className="overview-list">
                      {users.slice(0, 5).map((user) => (
                        <div key={user.id} className="overview-item">
                          <span className="overview-title">{user.name}</span>
                          <span className="overview-meta">{user.role} • {user.email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
