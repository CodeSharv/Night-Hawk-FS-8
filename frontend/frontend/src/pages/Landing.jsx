import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import EventCard from "../components/EventCard";
import { getEvents } from "../services/firestore";

export default function Landing() {
  const { currentUser, userProfile } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState([]);

  useEffect(() => {
    getEvents()
      .then((data) => setFeaturedEvents(data.slice(0, 3)))
      .catch(() => {});
  }, []);

  const getDashboardLink = () => {
    if (!userProfile) return "/dashboard";
    switch (userProfile.role) {
      case "organizer": return "/organizer";
      case "admin": return "/admin";
      default: return "/dashboard";
    }
  };

  return (
    <div className="landing-page" id="landing-page">

      {/* ====== Hero ====== */}
      <section className="hero-section">
        <div className="hero-bg-effects">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-orb hero-orb-3"></div>
        </div>

        <div className="hero-layout">
          {/* Left text */}
          <div className="hero-text">
            <span className="hero-badge">🚀 The #1 Campus Events Platform</span>
            <h1 className="hero-title">
              Never Miss a<br />
              <span className="gradient-text">Campus Moment</span>
            </h1>
            <p className="hero-subtitle">
              Discover, register, and manage campus events in one place.
              Whether you&apos;re a student looking for the next big thing or an
              organizer bringing ideas to life — we&apos;ve got you.
            </p>
            <div className="hero-actions">
              {currentUser ? (
                <Link to={getDashboardLink()} className="btn btn-primary btn-lg">
                  Go to Dashboard →
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="btn btn-primary btn-lg">Get Started Free →</Link>
                  <Link to="/events" className="btn btn-outline btn-lg">Browse Events</Link>
                </>
              )}
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-number">500+</span>
                <span className="hero-stat-label">Events Hosted</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">2,000+</span>
                <span className="hero-stat-label">Active Students</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">50+</span>
                <span className="hero-stat-label">Organizers</span>
              </div>
            </div>
          </div>

          {/* Right visual */}
          <div className="hero-visual">
            <div className="hero-visual-globe">
              <span>🎓</span>
              <div className="hero-pulse-ring"></div>
              <div className="hero-pulse-ring"></div>
              <div className="hero-pulse-ring"></div>
            </div>
            <div className="orbit-card">🎤 Tech Talks</div>
            <div className="orbit-card">🏀 Sports Fest</div>
            <div className="orbit-card">🎨 Art Show</div>
            <div className="orbit-card">💻 Hackathon</div>
          </div>
        </div>
      </section>

      {/* ====== Trusted ====== */}
      <div className="trusted-section">
        <p>Trusted by campus communities worldwide</p>
        <div className="trusted-logos">
          <span>MIT</span><span>Stanford</span><span>IIT</span><span>NIT</span><span>Harvard</span><span>Oxford</span>
        </div>
      </div>

      {/* ====== How It Works ====== */}
      <section className="how-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Create Your Account</h3>
            <p>Sign up as a student or organizer in seconds. No fees, no hassle.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Discover or Create</h3>
            <p>Browse events by category or create your own event and share it campus-wide.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Register & Attend</h3>
            <p>One-click RSVP, sync to Google Calendar, and show up ready.</p>
          </div>
        </div>
      </section>

      {/* ====== Features ====== */}
      <section className="features-section">
        <h2 className="section-title">Why CampusEvents?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon" style={{ background: "#6366f122" }}>
              <span style={{ color: "#6366f1", fontSize: "1.5rem" }}>⚡</span>
            </div>
            <h3>Real-time Discovery</h3>
            <p>Instantly find events with smart filters by category, date, and popularity.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ background: "#10b98122" }}>
              <span style={{ color: "#10b981", fontSize: "1.5rem" }}>📅</span>
            </div>
            <h3>Google Calendar Sync</h3>
            <p>Add events directly to your Google Calendar with one click. Never miss a session.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ background: "#f59e0b22" }}>
              <span style={{ color: "#f59e0b", fontSize: "1.5rem" }}>👥</span>
            </div>
            <h3>Organizer Dashboard</h3>
            <p>Full dashboard for organizers to create, manage, and track RSVPs in real-time.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ background: "#ec489922" }}>
              <span style={{ color: "#ec4899", fontSize: "1.5rem" }}>🔖</span>
            </div>
            <h3>Bookmarks & History</h3>
            <p>Save events you love, track registrations, and access everything from one place.</p>
          </div>
        </div>
      </section>

      {/* ====== Featured Events ====== */}
      {featuredEvents.length > 0 && (
        <section className="featured-section">
          <h2 className="section-title">Upcoming Events</h2>
          <div className="events-grid">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} showActions={false} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link to="/events" className="btn btn-outline btn-lg">View All Events →</Link>
          </div>
        </section>
      )}

      {/* ====== CTA ====== */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to discover what&apos;s happening?</h2>
          <p>Join thousands of students and organizers already using CampusEvents to stay connected.</p>
          {!currentUser && (
            <Link to="/signup" className="btn btn-primary btn-lg">Create Free Account →</Link>
          )}
        </div>
      </section>

      <footer className="landing-footer">
        <p>© 2025 CampusEvents. Built for students, by students.</p>
      </footer>
    </div>
  );
}
