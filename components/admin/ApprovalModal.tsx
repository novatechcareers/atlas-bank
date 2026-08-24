"use client";

import { useState } from "react";
import { approveTransfer } from "@/lib/adminData";
import type { TransferRequest } from "@/lib/adminData";

type ApprovalModalProps = {
  request: TransferRequest;
  onClose: () => void;
};

export default function ApprovalModal({ request, onClose }: ApprovalModalProps) {
  const [adminName, setAdminName] = useState("Admin User");

  const handleApprove = async () => {
    await approveTransfer(request.reference, adminName);
    window.location.reload();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h2>Approve Transfer</h2>
        <p>Confirm approval for reference {request.reference}.</p>
        <div className="field-group">
          <label htmlFor="adminName">Admin Name</label>
          <input id="adminName" value={adminName} onChange={(event) => setAdminName(event.target.value)} />
        </div>
        <div className="form-actions">
          <button className="secondary-btn" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-btn" type="button" onClick={handleApprove}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
