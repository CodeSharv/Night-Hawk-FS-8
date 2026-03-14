import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineDownload,
  HiArrowLeft,
} from "react-icons/hi";
import {
  getEvent,
  getBookmarks,
  getRegistrations,
  addBookmark,
  removeBookmark,
  registerForEvent,
} from "../services/firestore";

export default function EventDetails() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => { loadEvent(); }, [id]);

  async function loadEvent() {
    setLoading(true);
    try {
      const eventData = await getEvent(id);
      setEvent(eventData);

      if (currentUser) {
        const [bData, rData] = await Promise.all([
          getBookmarks(currentUser.uid),
          getRegistrations(currentUser.uid),
        ]);
        setIsBookmarked(bData.some((b) => b.eventId === id));
        setIsRegistered(rData.some((r) => r.eventId === id));
      }
    } catch (err) {
      console.error("Error loading event:", err);
      toast.error("Failed to load event");
    }
    setLoading(false);
  }

  async function handleBookmark() {
    if (!currentUser) return navigate("/login");
    try {
      if (isBookmarked) {
        await removeBookmark(currentUser.uid, id);
        setIsBookmarked(false);
        toast.success("Bookmark removed");
      } else {
        await addBookmark(currentUser.uid, id);
        setIsBookmarked(true);
        toast.success("Event bookmarked!");
      }
    } catch {
      toast.error("Failed to update bookmark");
    }
  }

  async function handleRegister() {
    if (!currentUser) return navigate("/login");
    if (isRegistered) return;
    try {
      await registerForEvent(currentUser.uid, id);
      setIsRegistered(true);
      setEvent((prev) => ({ ...prev, rsvpCount: (prev.rsvpCount || 0) + 1 }));
      toast.success("Successfully registered!");
    } catch {
      toast.error("Failed to register");
    }
  }

  function addToGoogleCalendar() {
    if (!event) return;

    // Format dates for Google Calendar URL (YYYYMMDDTHHmmSS)
    const startDate = new Date(`${event.date}T${event.time || "00:00"}`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // +2 hours

    const formatGCalDate = (d) =>
      d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      dates: `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`,
      details: event.description || "",
      location: event.location || "",
      sf: "true",
    });

    window.open(
      `https://calendar.google.com/calendar/render?${params.toString()}`,
      "_blank"
    );
    toast.success("Opening Google Calendar...");
  }

  if (loading)
    return <div className="page-loading"><div className="spinner"></div></div>;
  if (!event) return <div className="page-loading">Event not found</div>;

  const categoryColors = {
    Tech: "#6366f1", Sports: "#10b981", Cultural: "#f59e0b",
    Workshops: "#ec4899", Seminars: "#8b5cf6",
  };

  return (
    <div className="event-details-page" id="event-details-page">
      <div className="event-details-container">
        <button onClick={() => navigate(-1)} className="back-btn">
          <HiArrowLeft /> Back
        </button>

        <div className="event-details-banner">
          {event.image ? (
            <img src={event.image} alt={event.title} />
          ) : (
            <div className="event-details-placeholder"
              style={{ background: `linear-gradient(135deg, ${categoryColors[event.category] || "#6366f1"}44, ${categoryColors[event.category] || "#6366f1"}11)` }}>
              <span style={{ fontSize: "4rem" }}>🎉</span>
            </div>
          )}
          <span className="event-details-category" style={{ background: categoryColors[event.category] || "#6366f1" }}>
            {event.category}
          </span>
        </div>

        <div className="event-details-body">
          <div className="event-details-main">
            <h1>{event.title}</h1>
            <p className="event-details-desc">{event.description || "No description provided."}</p>
            <div className="event-details-info">
              <div className="info-item"><HiOutlineCalendar />
                <span>{new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
              </div>
              <div className="info-item"><HiOutlineClock /><span>{event.time}</span></div>
              <div className="info-item"><HiOutlineLocationMarker /><span>{event.location}</span></div>
              <div className="info-item"><HiOutlineUser /><span>Organized by {event.organizerName || "Unknown"}</span></div>
              <div className="info-item"><HiOutlineUsers /><span>{event.rsvpCount || 0} RSVPs</span></div>
            </div>
          </div>

          <div className="event-details-actions">
            <button className={`btn btn-lg ${isRegistered ? "btn-success" : "btn-primary"} btn-full`}
              onClick={handleRegister} disabled={isRegistered}>
              {isRegistered ? "✓ Registered" : "Register Now"}
            </button>
            <button className="btn btn-outline btn-lg btn-full" onClick={handleBookmark}>
              {isBookmarked ? (<><HiBookmark style={{ color: "#f59e0b" }} /> Bookmarked</>) : (<><HiOutlineBookmark /> Bookmark</>)}
            </button>
            <button className="btn btn-outline btn-lg btn-full" onClick={addToGoogleCalendar}>
              <HiOutlineCalendar /> Add to Google Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
