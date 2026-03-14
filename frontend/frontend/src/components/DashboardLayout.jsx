import Sidebar from "./Sidebar";

export default function DashboardLayout({ role, children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar role={role} />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
