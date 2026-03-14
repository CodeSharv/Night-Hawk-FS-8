import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import EventCard from "../components/EventCard";
import toast from "react-hot-toast";
import { HiOutlineSearch } from "react-icons/hi";
import {
  getEvents,
  getBookmarks,
  getRegistrations,
  addBookmark,
  removeBookmark,
  registerForEvent,
} from "../services/firestore";

const categories = ["All", "Tech", "Sports", "Cultural", "Workshops", "Seminars"];

export default function Events() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [registrations, setRegistrations] = useState(new Set());
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [activeCategory]);

  async function loadData() {
    setLoading(true);
    try {
      let data = await getEvents(activeCategory);
      if (sortBy === "popular") {
        data.sort((a, b) => (b.rsvpCount || 0) - (a.rsvpCount || 0));
      }
      setEvents(data);

      if (currentUser) {
        const [bData, rData] = await Promise.all([
          getBookmarks(currentUser.uid),
          getRegistrations(currentUser.uid),
        ]);
        setBookmarks(new Set(bData.map((x) => x.eventId)));
        setRegistrations(new Set(rData.map((x) => x.eventId)));
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function handleBookmark(eventId) {
    if (!currentUser) return toast.error("Please login to bookmark");
    try {
      if (bookmarks.has(eventId)) {
        await removeBookmark(currentUser.uid, eventId);
        setBookmarks((p) => { const n = new Set(p); n.delete(eventId); return n; });
        toast.success("Bookmark removed");
      } else {
        await addBookmark(currentUser.uid, eventId);
        setBookmarks((p) => new Set(p).add(eventId));
        toast.success("Bookmarked!");
      }
    } catch { toast.error("Failed"); }
  }

  async function handleRegister(eventId) {
    if (!currentUser) return toast.error("Please login to register");
    if (registrations.has(eventId)) return;
    try {
      await registerForEvent(currentUser.uid, eventId);
      setRegistrations((p) => new Set(p).add(eventId));
      toast.success("Registered!");
    } catch (err) { toast.error(err.message || "Failed"); }
  }

  const filtered = events.filter((e) =>
    e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="events-browse-page" id="events-browse-page">
      <div className="events-browse-container">
        <div className="events-browse-header">
          <h1>Explore Events</h1>
          <p>Discover exciting events happening on campus</p>
        </div>

        <div className="events-browse-controls">
          <div className="search-bar">
            <HiOutlineSearch className="search-icon" />
            <input type="text" placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="sort-controls">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
              <option value="date">Sort by Date</option>
              <option value="popular">Sort by Popularity</option>
            </select>
          </div>
        </div>

        <div className="category-tabs">
          {categories.map((cat) => (
            <button key={cat} className={`category-tab ${activeCategory === cat ? "active" : ""}`} onClick={() => setActiveCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state"><div className="spinner"></div><p>Loading events...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><span className="empty-icon">📭</span><h3>No events found</h3><p>Try a different category or search term</p></div>
        ) : (
          <div className="events-grid">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} isBookmarked={bookmarks.has(event.id)} isRegistered={registrations.has(event.id)} onBookmark={handleBookmark} onRegister={handleRegister} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
