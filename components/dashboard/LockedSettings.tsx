"use client";

import { useState } from "react";
import CustomerCareModal from "@/components/dashboard/CustomerCareModal";

export default function LockedSettings() {
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <section className="locked-settings-card">
      <div className="lock-icon" aria-hidden="true">🔒</div>
      <h2>Restricted Access</h2>
      <p>Changes to your:</p>
      <ul>
        <li>Email</li>
        <li>Phone Number</li>
        <li>Address</li>
        <li>Password</li>
        <li>Security Questions</li>
        <li>Account Ownership</li>
      </ul>
      <p>must be verified by Atlas Bank.</p>
      <button className="primary-btn" type="button" onClick={() => setShowContactModal(true)}>
        Contact customer care
      </button>

      <CustomerCareModal
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Account settings request"
        body="Your account settings are protected. Reach out to customer care to request changes."
      />
    </section>
  );
}
