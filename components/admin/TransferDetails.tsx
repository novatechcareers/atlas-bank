"use client";

import { useState } from "react";
import type { TransferRequest } from "@/lib/adminData";
import ApprovalModal from "@/components/admin/ApprovalModal";
import DeclineModal from "@/components/admin/DeclineModal";

type TransferDetailsProps = {
  request: TransferRequest;
  onClose: () => void;
};

export default function TransferDetails({ request, onClose }: TransferDetailsProps) {
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);

  return (
    <aside className="transfer-details-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Full transfer</p>
          <h3>{request.reference}</h3>
        </div>
        <button className="secondary-btn" type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="detail-grid">
        <div>
          <span>Customer Name</span>
          <strong>{request.customerName}</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>{request.customerEmail}</strong>
        </div>
        <div>
          <span>Recipient</span>
          <strong>{request.recipient}</strong>
        </div>
        <div>
          <span>Recipient Bank</span>
          <strong>{request.bank}</strong>
        </div>
        <div>
          <span>Recipient Account</span>
          <strong>{request.accountNumber}</strong>
        </div>
        <div>
          <span>SWIFT</span>
          <strong>{request.swift}</strong>
        </div>
        <div>
          <span>Amount</span>
          <strong>${request.amount.toFixed(2)}</strong>
        </div>
        <div>
          <span>Fee</span>
          <strong>${request.fee.toFixed(2)}</strong>
        </div>
        <div>
          <span>Total Debit</span>
          <strong>${request.totalDebit.toFixed(2)}</strong>
        </div>
        <div>
          <span>Description</span>
          <strong>{request.description}</strong>
        </div>
        <div>
          <span>Reference</span>
          <strong>{request.reference}</strong>
        </div>
        <div>
          <span>Submission Time</span>
          <strong>{request.submissionTime}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{request.status}</strong>
        </div>
      </div>

      <div className="form-actions">
        <button className="primary-btn" type="button" onClick={() => setApprovalOpen(true)}>
          Approve
        </button>
        <button className="secondary-btn" type="button" onClick={() => setDeclineOpen(true)}>
          Decline
        </button>
      </div>

      {approvalOpen && <ApprovalModal request={request} onClose={() => setApprovalOpen(false)} />}
      {declineOpen && <DeclineModal request={request} onClose={() => setDeclineOpen(false)} />}
    </aside>
  );
}
