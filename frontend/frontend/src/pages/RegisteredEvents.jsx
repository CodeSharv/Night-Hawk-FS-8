import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import EventCard from "../components/EventCard";
import toast from "react-hot-toast";
import { getRegistrations, cancelRegistration } from "../services/firestore";

export default function RegisteredEvents() {
  const { currentUser } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRegistrations(); }, []);

  async function loadRegistrations() {
    setLoading(true);
    try {
      const data = await getRegistrations(currentUser.uid);
      setRegistrations(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function handleCancel(eventId) {
    if (!confirm("Cancel registration for this event?")) return;
    try {
      await cancelRegistration(currentUser.uid, eventId);
      setRegistrations((prev) => prev.filter((r) => r.eventId !== eventId));
      toast.success("Registration cancelled");
    } catch { toast.error("Failed to cancel"); }
  }

  return (
    <DashboardLayout role="student">
      <div className="dashboard-content" id="registered-events-page">
        <div className="dashboard-header">
          <div>
            <h1>Registered Events</h1>
            <p className="subtitle">Events you&apos;ve RSVP&apos;d to</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state"><div className="spinner"></div></div>
        ) : registrations.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎟️</span>
            <h3>No registrations yet</h3>
            <p>Register for events from the discovery feed</p>
          </div>
        ) : (
          <div className="events-grid">
            {registrations.map((r) =>
              r.event ? (
                <div key={r.id} className="registered-event-wrap">
                  <EventCard event={r.event} isRegistered={true} showActions={false} />
                  <button className="btn btn-outline btn-sm cancel-reg-btn" onClick={() => handleCancel(r.eventId)}>
                    Cancel Registration
                  </button>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
