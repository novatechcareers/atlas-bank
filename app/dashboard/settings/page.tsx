"use client";

"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import LockedSettings from "@/components/dashboard/LockedSettings";
import SupportCard from "@/components/dashboard/SupportCard";
import CustomerCareModal from "@/components/dashboard/CustomerCareModal";

export default function SettingsPage() {
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <main className="dashboard-page settings-page">
      <Sidebar />

      <section className="dashboard-main">
        <TopNavbar userName="Daniel" />

        <section className="settings-shell">
          <div className="settings-header">
            <div>
              <p className="eyebrow">Account settings</p>
              <h1>Account Settings</h1>
              <p>For your protection, sensitive account settings cannot be modified online.</p>
            </div>
          </div>

          <LockedSettings />
          <SupportCard />

          <div className="settings-actions">
            <button className="primary-btn" type="button" onClick={() => setShowContactModal(true)}>
              Contact Customer Care
            </button>
            <Link className="secondary-btn" href="/dashboard">
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
