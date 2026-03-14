import { NavLink } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineCalendar,
  HiOutlineBookmark,
  HiOutlineTicket,
  HiOutlineBell,
  HiOutlineUser,
  HiOutlinePlus,
  HiOutlineCog,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineClipboardList,
} from "react-icons/hi";

const studentLinks = [
  { to: "/dashboard", icon: <HiOutlineHome />, label: "Dashboard" },
  { to: "/events", icon: <HiOutlineCalendar />, label: "Explore Events" },
  { to: "/dashboard/create", icon: <HiOutlinePlus />, label: "Create Event" },
  { to: "/bookmarks", icon: <HiOutlineBookmark />, label: "Bookmarks" },
  {
    to: "/registered",
    icon: <HiOutlineTicket />,
    label: "Registered Events",
  },
  { to: "/profile", icon: <HiOutlineUser />, label: "Profile" },
];

const organizerLinks = [
  { to: "/organizer", icon: <HiOutlineHome />, label: "Dashboard" },
  { to: "/organizer/create", icon: <HiOutlinePlus />, label: "Create Event" },
  {
    to: "/organizer/manage",
    icon: <HiOutlineCog />,
    label: "Manage Events",
  },
  {
    to: "/organizer/rsvps",
    icon: <HiOutlineClipboardList />,
    label: "RSVP Tracking",
  },
  { to: "/profile", icon: <HiOutlineUser />, label: "Profile" },
];

const adminLinks = [
  { to: "/admin", icon: <HiOutlineHome />, label: "Dashboard" },
  { to: "/admin/events", icon: <HiOutlineCalendar />, label: "All Events" },
  { to: "/admin/users", icon: <HiOutlineUsers />, label: "Manage Users" },
  { to: "/admin/stats", icon: <HiOutlineChartBar />, label: "Analytics" },
  { to: "/profile", icon: <HiOutlineUser />, label: "Profile" },
];

export default function Sidebar({ role = "student" }) {
  const links =
    role === "admin"
      ? adminLinks
      : role === "organizer"
      ? organizerLinks
      : studentLinks;

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/dashboard" || link.to === "/organizer" || link.to === "/admin"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span className="sidebar-label">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
