"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import LockedSettings from "@/components/dashboard/LockedSettings";
import SupportCard from "@/components/dashboard/SupportCard";
import CustomerCareModal from "@/components/dashboard/CustomerCareModal";
import { getNewUserSession, type NewUserAccount } from "@/lib/newUserData";

export default function NewUserSettingsPage() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [session, setSession] = useState<NewUserAccount | null>(null);

  useEffect(() => {
    setSession(getNewUserSession());
  }, []);

  return (
    <main className="dashboard-page settings-page">
      <Sidebar basePath="/new-user" />

      <section className="dashboard-main">
        <TopNavbar userName={session?.customerName ?? "New Customer"} balance={session?.availableBalance ?? "$0.00"} variant="new-user" />

        <section className="settings-shell">
          <div className="settings-header">
            <div>
              <p className="eyebrow">Account settings</p>
              <h1>Account Settings</h1>
              <p>Your security preferences remain protected and can be updated through customer care.</p>
            </div>
          </div>

          <LockedSettings />
          <SupportCard />

          <div className="settings-actions">
            <button className="primary-btn" type="button" onClick={() => setShowContactModal(true)}>
              Contact Customer Care
            </button>
            <Link className="secondary-btn" href="/new-user/dashboard">
              Back to Dashboard
            </Link>
          </div>

          <CustomerCareModal
            open={showContactModal}
            onClose={() => setShowContactModal(false)}
            title="Customer care request"
            body="Please contact our team for assistance with account settings or support requests."
          />
        </section>
      </section>
    </main>
  );
}
