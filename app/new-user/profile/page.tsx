"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import ProfileCard from "@/components/dashboard/ProfileCard";
import ProfileInfo from "@/components/dashboard/ProfileInfo";
import { getNewUserSession, markNewUserProfileCompleted, saveNewUserSession, type NewUserAccount } from "@/lib/newUserData";

export default function NewUserProfilePage() {
  const [session, setSession] = useState<NewUserAccount | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const storedSession = getNewUserSession();
    setSession(storedSession);
    if (storedSession && !storedSession.profileCompleted) {
      markNewUserProfileCompleted(storedSession);
    }
  }, []);

  return (
    <main className="dashboard-page profile-page">
      <Sidebar basePath="/new-user" />

      <section className="dashboard-main">
        <TopNavbar userName={session?.customerName ?? "New Customer"} balance={session?.availableBalance ?? "$0.00"} variant="new-user" />

        <section className="profile-shell">
          <div className="profile-header">
            <div>
              <p className="eyebrow">Customer profile</p>
              <h1>My Profile</h1>
              <p>Complete your personal information so the account can be activated for transfers and card management.</p>
            </div>
          </div>

          <div className="profile-grid">
            <ProfileCard
              name={session?.customerName ?? "New Customer"}
              email={session?.customerEmail ?? "new.customer@atlasbank.com"}
              phone={session?.phone || "Not provided"}
              customerId={session?.customerId}
              dob={session?.dob || "Not provided"}
              address={session?.address || "Not provided"}
              avatarUrl={session?.avatarUrl}
              editing={isEditing}
              onEditToggle={() => setIsEditing((current) => !current)}
              onProfileUpdate={(next) => {
                const updatedSession = session ? { ...session, ...next } : null;
                if (updatedSession) {
                  saveNewUserSession(updatedSession);
                  setSession(updatedSession);
                }
              }}
            />
            <ProfileInfo
              accountNumber={session?.accountNumber}
              iban={session?.iban}
              swift={session?.swift}
              customerSince={session?.customerSince}
              accountType={session?.accountType}
              onEditProfile={() => setIsEditing(true)}
            />
          </div>
        </section>
      </section>
    </main>
  );
}
