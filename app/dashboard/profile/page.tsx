"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import ProfileCard from "@/components/dashboard/ProfileCard";
import ProfileInfo from "@/components/dashboard/ProfileInfo";

export default function ProfilePage() {
  return (
    <main className="dashboard-page profile-page">
      <Sidebar />

      <section className="dashboard-main">
        <TopNavbar userName="Daniel" />

        <section className="profile-shell">
          <div className="profile-header">
            <div>
              <p className="eyebrow">Customer profile</p>
              <h1>My Profile</h1>
              <p>Manage your personal information and banking details.</p>
            </div>
          </div>

          <div className="profile-grid">
            <ProfileCard />
            <ProfileInfo />
          </div>
        </section>
      </section>
    </main>
  );
}
