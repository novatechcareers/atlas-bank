"use client";

import { useEffect, useState } from "react";
import { DEMO_CUSTOMER_EMAIL, loadTransferRequestsFromSupabase, TransferRequest } from "@/lib/adminData";
import { getNewUserSession, loadNewUserTransfers } from "@/lib/newUserData";

type TransactionListProps = {
  variant?: "demo" | "new-user";
  basePath?: string;
};

export default function TransactionList({ variant = "demo", basePath = "/dashboard" }: TransactionListProps) {
  const [transactions, setTransactions] = useState<TransferRequest[]>([]);

  useEffect(() => {
    const loadTransactions = async () => {
      if (variant === "new-user") {
        const session = getNewUserSession();
        const stored = await loadNewUserTransfers(session?.customerEmail);
        setTransactions(stored.slice(0, 4) as unknown as TransferRequest[]);
        return;
      }
      const stored = await loadTransferRequestsFromSupabase(true);
      const demoTransfers = stored.filter((transfer) => transfer.customerEmail.toLowerCase() === DEMO_CUSTOMER_EMAIL.toLowerCase());
      setTransactions(demoTransfers.slice(0, 4));
    };

    loadTransactions();

    if (variant === "new-user") {
      const handleTransfersUpdated = () => {
        void loadTransactions();
      };

      window.addEventListener("atlas-new-user-transfers-updated", handleTransfersUpdated);
      window.addEventListener("storage", handleTransfersUpdated);

      return () => {
        window.removeEventListener("atlas-new-user-transfers-updated", handleTransfersUpdated);
        window.removeEventListener("storage", handleTransfersUpdated);
      };
    }
  }, [variant]);

  return (
    <section className="dashboard-panel" aria-labelledby="transactions-title">
      <div className="dashboard-panel-heading">
        <h3 id="transactions-title">Recent transfers</h3>
        <a href={`${basePath}/transactions`}>View all</a>
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
