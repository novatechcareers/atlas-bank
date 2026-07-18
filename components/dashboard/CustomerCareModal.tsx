"use client";

import { useEffect } from "react";

type CustomerCareModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  body?: string;
};

const CUSTOMER_CARE_EMAIL = "workdaysupport.novatech@gmail.com";
const CUSTOMER_CARE_SUBJECT = encodeURIComponent("Careers Inquiry");
const CUSTOMER_CARE_GMAIL_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${CUSTOMER_CARE_EMAIL}&su=${CUSTOMER_CARE_SUBJECT}`;

export default function CustomerCareModal({ open, onClose, title = "Contact customer care", body = "Please reach out to our support team for assistance with this request." }: CustomerCareModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="customer-care-overlay" role="dialog" aria-modal="true" aria-label="Customer care support">
      <div className="customer-care-modal">
        <div className="customer-care-modal-icon">✉</div>
        <h3>{title}</h3>
        <p>{body}</p>
        <div className="customer-care-actions">
          <a className="primary-btn" href={CUSTOMER_CARE_GMAIL_URL} target="_blank" rel="noopener noreferrer">
            Email customer care
          </a>
          <button className="secondary-btn" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
