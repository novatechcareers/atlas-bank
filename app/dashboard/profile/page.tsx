"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import ProfileCard from "@/components/dashboard/ProfileCard";
import ProfileInfo from "@/components/dashboard/ProfileInfo";

type DemoProfileState = {
  name: string;
  email: string;
  phone: string;
  customerId: string;
  dob: string;
  address: string;
  avatarUrl?: string;
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<DemoProfileState>({
    name: "Daniel Morgan",
    email: "daniel.morgan@atlasbank.com",
    phone: "+1 *** *** 7891",
    customerId: "ATB-102938",
    dob: "March 12 1995",
    address: "New York, USA",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    setProfile({
      name: window.localStorage.getItem("customerName") || "Daniel Morgan",
      email: window.localStorage.getItem("customerEmail") || "daniel.morgan@atlasbank.com",
      phone: window.localStorage.getItem("phone") || "+1 *** *** 7891",
      customerId: window.localStorage.getItem("customerId") || "ATB-102938",
      dob: window.localStorage.getItem("dob") || "March 12 1995",
      address: window.localStorage.getItem("address") || "New York, USA",
      avatarUrl: window.localStorage.getItem("profileAvatar") || undefined,
    });
  }, []);

  const accountNumber = useMemo(() => typeof window !== "undefined" ? window.localStorage.getItem("accountNumber") || "4589201834" : "4589201834", []);
  const iban = useMemo(() => typeof window !== "undefined" ? window.localStorage.getItem("iban") || "GB89ABCD1234567890" : "GB89ABCD1234567890", []);
  const swift = useMemo(() => typeof window !== "undefined" ? window.localStorage.getItem("swift") || "ATLSUS33" : "ATLSUS33", []);
  const customerSince = useMemo(() => typeof window !== "undefined" ? window.localStorage.getItem("customerSince") || "March 2019" : "March 2019", []);
  const accountType = useMemo(() => typeof window !== "undefined" ? window.localStorage.getItem("accountType") || "Premier Checking" : "Premier Checking", []);

  return (
    <main className="dashboard-page profile-page">
      <Sidebar />

      <section className="dashboard-main">
        <TopNavbar userName={profile.name || "Daniel"} />

        <section className="profile-shell">
          <div className="profile-header">
            <div>
              <p className="eyebrow">Customer profile</p>
              <h1>My Profile</h1>
              <p>Manage your personal information and banking details.</p>
            </div>
          </div>

          <div className="profile-grid">
            <ProfileCard
              name={profile.name}
              email={profile.email}
              phone={profile.phone}
              customerId={profile.customerId}
              dob={profile.dob}
              address={profile.address}
              avatarUrl={profile.avatarUrl}
              editing={isEditing}
              onEditToggle={() => setIsEditing((current) => !current)}
              onProfileUpdate={(next) => setProfile({ ...profile, ...next })}
            />
            <ProfileInfo
              accountNumber={accountNumber}
              iban={iban}
              swift={swift}
              customerSince={customerSince}
              accountType={accountType}
              onEditProfile={() => setIsEditing(true)}
            />
          </div>
        </section>
      </section>
    </main>
  );
}
