import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import EventCard from "../components/EventCard";
import toast from "react-hot-toast";
import { getBookmarks, removeBookmark } from "../services/firestore";

export default function Bookmarks() {
  const { currentUser } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadBookmarks(); }, []);

  async function loadBookmarks() {
    setLoading(true);
    try {
      const data = await getBookmarks(currentUser.uid);
      setBookmarks(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function handleRemoveBookmark(eventId) {
    try {
      await removeBookmark(currentUser.uid, eventId);
      setBookmarks((prev) => prev.filter((b) => b.eventId !== eventId));
      toast.success("Bookmark removed");
    } catch { toast.error("Failed to remove"); }
  }

  return (
    <DashboardLayout role="student">
      <div className="dashboard-content" id="bookmarks-page">
        <div className="dashboard-header">
          <div>
            <h1>Bookmarked Events</h1>
            <p className="subtitle">Events you&apos;ve saved for later</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state"><div className="spinner"></div></div>
        ) : bookmarks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔖</span>
            <h3>No bookmarks yet</h3>
            <p>Bookmark events from the discovery feed to save them here</p>
          </div>
        ) : (
          <div className="events-grid">
            {bookmarks.map((b) =>
              b.event ? (
                <EventCard
                  key={b.id}
                  event={b.event}
                  isBookmarked={true}
                  onBookmark={() => handleRemoveBookmark(b.eventId)}
                  showActions={true}
                />
              ) : null
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
