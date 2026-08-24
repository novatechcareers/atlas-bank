"use client";

import { useState } from "react";
import { updateCustomerSuspension, type CustomerSuspension } from "@/lib/newUserData";

type AdminSuspensionControlsProps = {
  customers: CustomerSuspension[];
  onUpdated: (customer: CustomerSuspension) => void;
};

export default function AdminSuspensionControls({ customers, onUpdated }: AdminSuspensionControlsProps) {
  const [selectedEmail, setSelectedEmail] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedCustomer = customers.find((customer) => customer.email === selectedEmail);

  const handleSuspend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCustomer) {
      setMessage("Select a customer first.");
      return;
    }

    setIsSaving(true);
    setMessage("");
    try {
      const updatedCustomer = await updateCustomerSuspension(selectedCustomer.email, true, reason);
      if (updatedCustomer) {
        onUpdated(updatedCustomer);
        setReason("");
        setMessage(`${updatedCustomer.fullName} has been suspended.`);
      }
    } catch {
      setMessage("We could not update this customer's suspension status.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSuspension = async () => {
    if (!selectedCustomer) {
      setMessage("Select a customer first.");
      return;
    }

    setIsSaving(true);
    setMessage("");
    try {
      const updatedCustomer = await updateCustomerSuspension(selectedCustomer.email, false);
      if (updatedCustomer) {
        onUpdated(updatedCustomer);
        setMessage(`Suspension removed for ${updatedCustomer.fullName}.`);
      }
    } catch {
      setMessage("We could not remove this customer's suspension.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="admin-fund-card">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Admin action</p>
          <h3>Manage customer suspension</h3>
        </div>
      </div>

      <form className="transfer-form" onSubmit={handleSuspend}>
        <div className="field-group">
          <label htmlFor="suspension-customer">Customer</label>
          <select id="suspension-customer" value={selectedEmail} onChange={(event) => setSelectedEmail(event.target.value)}>
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.email} value={customer.email}>
                {customer.fullName} ({customer.email}){customer.suspended ? " - Suspended" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="suspension-reason">Reason for suspension</label>
          <textarea id="suspension-reason" rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="State why this account is suspended" />
        </div>

        {selectedCustomer?.suspended ? (
          <p className="settings-note">Current reason: {selectedCustomer.suspensionReason || "No reason provided."}</p>
        ) : null}

        <div className="form-actions">
          <button className="primary-btn" type="submit" disabled={isSaving || !selectedCustomer}>
            {isSaving ? "Saving..." : "Suspend customer"}
          </button>
          <button className="secondary-btn" type="button" onClick={handleRemoveSuspension} disabled={isSaving || !selectedCustomer || !selectedCustomer.suspended}>
            Remove suspension
          </button>
        </div>

        {message ? <p className="settings-note" role="status">{message}</p> : null}
      </form>
    </section>
  );
}
