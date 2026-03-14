import { Link } from "react-router-dom";
import {
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineCalendar,
} from "react-icons/hi";

const categoryColors = {
  Tech: "#6366f1",
  Sports: "#10b981",
  Cultural: "#f59e0b",
  Workshops: "#ec4899",
  Seminars: "#8b5cf6",
};

export default function EventCard({
  event,
  onBookmark,
  onRegister,
  isBookmarked,
  isRegistered,
  showActions = true,
}) {
  const catColor = categoryColors[event.category] || "#6366f1";

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="event-card" id={`event-card-${event.id}`}>
      <div className="event-card-image">
        {event.image ? (
          <img src={event.image} alt={event.title} />
        ) : (
          <div
            className="event-card-placeholder"
            style={{ background: `linear-gradient(135deg, ${catColor}33, ${catColor}11)` }}
          >
            <span style={{ color: catColor, fontSize: "2rem" }}>🎉</span>
          </div>
        )}
        <span
          className="event-card-category"
          style={{ background: catColor }}
        >
          {event.category}
        </span>
        {showActions && (
          <button
            className="event-card-bookmark"
            onClick={(e) => {
              e.preventDefault();
              onBookmark?.(event.id);
            }}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {isBookmarked ? (
              <HiBookmark style={{ color: "#f59e0b" }} />
            ) : (
              <HiOutlineBookmark />
            )}
          </button>
        )}
      </div>

      <div className="event-card-body">
        <h3 className="event-card-title">{event.title}</h3>
        <p className="event-card-organizer">
          by {event.organizerName || "Unknown"}
        </p>

        <div className="event-card-meta">
          <span>
            <HiOutlineCalendar /> {formatDate(event.date)}
          </span>
          <span>
            <HiOutlineClock /> {event.time}
          </span>
          <span>
            <HiOutlineLocationMarker /> {event.location}
          </span>
        </div>

        <div className="event-card-footer">
          <Link
            to={`/events/${event.id}`}
            className="btn btn-outline btn-sm"
          >
            View Details
          </Link>
          {showActions && (
            <button
              className={`btn btn-sm ${
                isRegistered ? "btn-success" : "btn-primary"
              }`}
              onClick={() => onRegister?.(event.id)}
              disabled={isRegistered}
            >
              {isRegistered ? "✓ Registered" : "Register"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
