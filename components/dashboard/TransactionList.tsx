"use client";

import { useEffect, useState } from "react";
import { loadTransferRequestsFromSupabase, TransferRequest } from "@/lib/adminData";

export default function TransactionList() {
  const [transactions, setTransactions] = useState<TransferRequest[]>([]);

  useEffect(() => {
    const loadTransactions = async () => {
      const stored = await loadTransferRequestsFromSupabase(true);
      setTransactions(stored.slice(0, 4));
    };

    loadTransactions();
  }, []);

  return (
    <section className="dashboard-panel" aria-labelledby="transactions-title">
      <div className="dashboard-panel-heading">
        <h3 id="transactions-title">Recent transfers</h3>
        <a href="/dashboard/transactions">View all</a>
      </div>

      <ul className="transaction-list">
        {transactions.map((transaction) => (
          <li key={transaction.reference} className="transaction-item">
            <div>
              <strong>{transaction.recipient}</strong>
              <p>{transaction.description}</p>
            </div>
            <div className="transaction-meta">
              <span className={transaction.direction === "incoming" ? "positive" : "negative"}>
                {transaction.direction === "incoming" ? "+" : "-"}$
                {transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`status-pill ${transaction.status.toLowerCase()}`}>{transaction.status}</span>
              <small>{transaction.submissionTime}</small>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
