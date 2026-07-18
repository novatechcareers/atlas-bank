"use client";

import { useState } from "react";
import { declineTransfer } from "@/lib/adminData";
import type { TransferRequest } from "@/lib/adminData";

type DeclineModalProps = {
  request: TransferRequest;
  onClose: () => void;
};

const reasons = [
  "Insufficient Funds",
  "Account Verification Required",
  "Compliance Review",
  "Incorrect Recipient Details",
  "Fraud Prevention",
  "Custom Reason",
];

export default function DeclineModal({ request, onClose }: DeclineModalProps) {
  const [reason, setReason] = useState(reasons[0]);
  const [customReason, setCustomReason] = useState("");
  const [adminName, setAdminName] = useState("Admin User");

  const handleConfirm = async () => {
    const finalReason = reason === "Custom Reason" ? customReason || "Declined by admin" : reason;
    await declineTransfer(request.reference, finalReason, adminName);
    window.location.reload();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h2>Decline Transfer</h2>
        <div className="field-group">
          <label htmlFor="reason">Reason</label>
          <select id="reason" value={reason} onChange={(event) => setReason(event.target.value)}>
            {reasons.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        {reason === "Custom Reason" && (
          <div className="field-group">
            <label htmlFor="customReason">Custom reason</label>
            <input id="customReason" value={customReason} onChange={(event) => setCustomReason(event.target.value)} />
          </div>
        )}
        <div className="field-group">
          <label htmlFor="adminName">Admin Name</label>
          <input id="adminName" value={adminName} onChange={(event) => setAdminName(event.target.value)} />
        </div>
        <div className="form-actions">
          <button className="secondary-btn" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-btn" type="button" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
