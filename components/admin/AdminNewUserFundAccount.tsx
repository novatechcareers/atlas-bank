"use client";

import { useEffect, useState } from "react";
import { createFundedTransferRequest } from "@/lib/adminData";
import { getRegisteredNewUsers } from "@/lib/newUserData";

type RegisteredUser = {
  email: string;
  fullName: string;
  phone?: string;
};

export default function AdminNewUserFundAccount() {
  const [amount, setAmount] = useState("1000");
  const [description, setDescription] = useState("Admin funding");
  const [reference, setReference] = useState("");
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setRegisteredUsers(getRegisteredNewUsers());
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedAmount = Number(amount);
    if (!parsedAmount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setMessage("Enter a valid amount.");
      return;
    }

    if (!selectedUserEmail) {
      setMessage("Select a new-user account to fund.");
      return;
    }

    const created = await createFundedTransferRequest({
      amount: parsedAmount,
      description: description.trim() || "Admin funding",
      reference: reference.trim() || undefined,
      target: "new-user",
      targetEmail: selectedUserEmail,
    });

    setMessage(`Funding recorded for ${selectedUserEmail}. Reference: ${created.reference}`);
    setAmount("1000");
    setDescription("Admin funding");
    setReference("");
  };

  return (
    <section className="admin-fund-card">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">New-user funding</p>
          <h3>Fund a new-user account</h3>
        </div>
      </div>

      <form className="transfer-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="fund-user">New user</label>
          <select
            id="fund-user"
            value={selectedUserEmail}
            onChange={(event) => setSelectedUserEmail(event.target.value)}
          >
            <option value="">Select a new-user account</option>
            {registeredUsers.map((user) => (
              <option key={user.email} value={user.email}>
                {user.fullName} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="fund-amount">Amount</label>
          <input
            id="fund-amount"
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>

        <div className="field-group">
          <label htmlFor="fund-description">Description</label>
          <input
            id="fund-description"
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="field-group">
          <label htmlFor="fund-reference">Reference ID</label>
          <input
            id="fund-reference"
            type="text"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="Optional"
          />
        </div>

        <div className="form-actions">
          <button className="primary-btn" type="submit">Fund new-user</button>
        </div>

        {message ? <p className="settings-note">{message}</p> : null}
      </form>
    </section>
  );
}
