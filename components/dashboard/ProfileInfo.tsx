import { useState } from "react";
import CustomerCareModal from "@/components/dashboard/CustomerCareModal";

export default function ProfileInfo() {
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <section className="profile-info-panel">
      <div className="profile-info-group">
        <div>
          <p className="eyebrow">Banking information</p>
          <h2>Bank details</h2>
        </div>
        <div className="info-grid">
          <div>
            <span>Account Number</span>
            <strong>4589201834</strong>
          </div>
          <div>
            <span>IBAN</span>
            <strong>GB89ABCD1234567890</strong>
          </div>
          <div>
            <span>SWIFT</span>
            <strong>ATLSUS33</strong>
          </div>
          <div>
            <span>Customer Since</span>
            <strong>March 2019</strong>
          </div>
          <div>
            <span>Account Type</span>
            <strong>Premier Checking</strong>
          </div>
          <div>
            <span>Branch</span>
            <strong>Atlas Manhattan</strong>
          </div>
        </div>
      </div>

      <div className="profile-info-group">
        <div>
          <p className="eyebrow">Security information</p>
          <h2>Account security</h2>
        </div>
        <div className="info-grid">
          <div>
            <span>Password</span>
            <strong>********</strong>
          </div>
          <div>
            <span>Two-Factor Authentication</span>
            <strong>Enabled</strong>
          </div>
          <div>
            <span>Last Login</span>
            <strong>Today</strong>
          </div>
        </div>
      </div>

      <button className="secondary-btn" type="button" onClick={() => setShowContactModal(true)}>
        Edit Profile
      </button>

      <CustomerCareModal
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Profile update request"
        body="Personal information is protected. To update your profile details, please contact customer care."
      />
    </section>
  );
}
