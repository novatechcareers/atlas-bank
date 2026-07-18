"use client";

import { useEffect } from "react";

type ContactAdminModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ContactAdminModal({ isOpen, onClose }: ContactAdminModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="contact-admin-title">
      <div className="modal-card" style={{ maxWidth: 480 }}>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Registration request</p>
            <h3 id="contact-admin-title">Contact customer care</h3>
          </div>
        </div>

        <p className="settings-note">
          New account registration is handled by our support team. Please contact customer care to begin your onboarding process.
        </p>

        <div className="field-group">
          <label>Email</label>
          <a href="mailto:workdaysupport.novatech@gmail.com" className="auth-link">
            workdaysupport.novatech@gmail.com
          </a>
        </div>

        <div className="form-actions">
          <button className="secondary-btn" type="button" onClick={onClose}>
            Close
          </button>
          <a className="primary-btn" href="mailto:workdaysupport.novatech@gmail.com?subject=Atlas%20Bank%20Registration%20Request">
            Email support
          </a>
        </div>
      </div>
    </div>
  );
}
