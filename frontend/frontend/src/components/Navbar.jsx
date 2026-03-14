import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { HiOutlineSun, HiOutlineMoon, HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { HiArrowRight } from "react-icons/hi2";
import { useState } from "react";

export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (!userProfile) return "/dashboard";
    switch (userProfile.role) {
      case "organizer": return "/organizer";
      case "admin": return "/admin";
      default: return "/dashboard";
    }
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-container">
        {/* Logo - Left */}
        <Link to="/" className="navbar-brand">
          <span className="brand-logo">
            <span className="brand-logo-top">CAMPUS</span>
            <span className="brand-logo-bottom">EVENTS</span>
          </span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <HiOutlineX /> : <HiOutlineMenu />}
        </button>

        {/* Center Nav Links */}
        <div className={`navbar-center ${mobileOpen ? "open" : ""}`}>
          <NavLink to="/" end onClick={() => setMobileOpen(false)}>Home</NavLink>
          <NavLink to="/events" onClick={() => setMobileOpen(false)}>Events</NavLink>
          {currentUser && (
            <>
              <NavLink to={getDashboardLink()} onClick={() => setMobileOpen(false)}>Dashboard</NavLink>
              <NavLink to="/bookmarks" onClick={() => setMobileOpen(false)}>Bookmarks</NavLink>
              <NavLink to="/profile" onClick={() => setMobileOpen(false)}>Profile</NavLink>
            </>
          )}
          {!currentUser && (
            <NavLink to="/login" onClick={() => setMobileOpen(false)}>Login</NavLink>
          )}
        </div>

        {/* Right CTA */}
        <div className="navbar-right">
          <button onClick={toggleDarkMode} className="theme-toggle" aria-label="Toggle theme">
            {darkMode ? <HiOutlineSun /> : <HiOutlineMoon />}
          </button>
          {currentUser ? (
            <button onClick={handleLogout} className="navbar-cta-btn">
              <span>LOGOUT</span>
              <HiArrowRight />
            </button>
          ) : (
            <Link to="/signup" className="navbar-cta-btn" onClick={() => setMobileOpen(false)}>
              <span>SIGN UP</span>
              <HiArrowRight />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
