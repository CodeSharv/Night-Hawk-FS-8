import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import toast from "react-hot-toast";
import { HiOutlineUser, HiOutlineMail, HiOutlineBadgeCheck } from "react-icons/hi";
import { updateUserProfile } from "../services/firestore";

export default function Profile() {
  const { userProfile, currentUser, refreshProfile } = useAuth();
  const [name, setName] = useState(userProfile?.name || "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(currentUser.uid, { name });
      await refreshProfile();
      toast.success("Profile updated!");
    } catch { toast.error("Failed to update profile"); }
    setSaving(false);
  }

  const role = userProfile?.role || "student";

  return (
    <DashboardLayout role={role}>
      <div className="dashboard-content" id="profile-page">
        <div className="dashboard-header">
          <div>
            <h1>Profile</h1>
            <p className="subtitle">Manage your account details</p>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-avatar">
            <span className="avatar-text">
              {(userProfile?.name || "U").charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="profile-info">
            <div className="profile-detail"><HiOutlineUser /><span>{userProfile?.name || "N/A"}</span></div>
            <div className="profile-detail"><HiOutlineMail /><span>{currentUser?.email || "N/A"}</span></div>
            <div className="profile-detail"><HiOutlineBadgeCheck /><span className={`role-badge badge-${role}`}>{role}</span></div>
          </div>

          <form onSubmit={handleSave} className="profile-form">
            <div className="form-group">
              <label>Display Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
