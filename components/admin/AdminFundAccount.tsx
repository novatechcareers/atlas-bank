"use client";

import { useState } from "react";
import { createFundedTransferRequest } from "@/lib/adminData";

export default function AdminFundAccount() {
  const [amount, setAmount] = useState("1000");
  const [description, setDescription] = useState("Admin funding");
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!parsedAmount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setMessage("Enter a valid amount.");
      return;
    }

    const created = await createFundedTransferRequest({
      amount: parsedAmount,
      description: description.trim() || "Admin funding",
      reference: reference.trim() || undefined,
    });

    setMessage(`Funding recorded successfully. Reference: ${created.reference}`);
    setAmount("1000");
    setDescription("Admin funding");
    setReference("");
  };

  return (
    <section className="admin-fund-card">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Admin action</p>
          <h3>Fund customer account</h3>
        </div>
      </div>

      <form className="transfer-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="fund-amount">Amount</label>
          <input id="fund-amount" type="number" min="1" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} />
        </div>

        <div className="field-group">
          <label htmlFor="fund-description">Description</label>
          <input id="fund-description" type="text" value={description} onChange={(event) => setDescription(event.target.value)} />
        </div>

        <div className="field-group">
          <label htmlFor="fund-reference">Reference ID</label>
          <input id="fund-reference" type="text" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Optional" />
        </div>

        <div className="form-actions">
          <button className="primary-btn" type="submit">Fund account</button>
        </div>

        {message ? <p className="settings-note">{message}</p> : null}
      </form>
    </section>
  );
}
