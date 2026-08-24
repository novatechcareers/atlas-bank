"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import TransactionStats from "@/components/dashboard/TransactionStats";
import TransactionFilters from "@/components/dashboard/TransactionFilters";
import TransactionTable from "@/components/dashboard/TransactionTable";
import Pagination from "@/components/dashboard/Pagination";
import { getNewUserSession, loadNewUserTransfers, type NewUserAccount, type NewUserTransfer } from "@/lib/newUserData";

export default function NewUserTransactionsPage() {
  const [session, setSession] = useState<NewUserAccount | null>(null);
  const [transactions, setTransactions] = useState<NewUserTransfer[]>([]);
  const [summary, setSummary] = useState({ incoming: "$0.00", outgoing: "$0.00", fees: "$0.00", count: 0 });

  useEffect(() => {
    const loadTransactions = async () => {
      const storedSession = getNewUserSession();
      setSession(storedSession);

      try {
        const loaded = await loadNewUserTransfers(storedSession?.customerEmail);
        setTransactions(loaded);
        const incoming = loaded
          .filter((transfer) => transfer.direction === "incoming" && transfer.status === "Approved")
          .reduce((sum, transfer) => sum + transfer.amount, 0);
        const outgoing = loaded
          .filter((transfer) => transfer.direction === "outbound" && transfer.status === "Approved")
          .reduce((sum, transfer) => sum + transfer.totalDebit, 0);
        const fees = loaded.reduce((sum, transfer) => sum + transfer.fee, 0);

        setSummary({
          incoming: `$${incoming.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          outgoing: `$${outgoing.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          fees: `$${fees.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          count: loaded.length,
        });
      } catch {
        // ignore load errors
      }
    };

    loadTransactions();

    const handleTransfersUpdated = () => {
      void loadTransactions();
    };

    window.addEventListener("atlas-new-user-transfers-updated", handleTransfersUpdated);
    window.addEventListener("storage", handleTransfersUpdated);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        void loadTransactions();
      }
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadTransactions();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("atlas-new-user-transfers-updated", handleTransfersUpdated);
      window.removeEventListener("storage", handleTransfersUpdated);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <main className="dashboard-page transactions-page">
      <Sidebar basePath="/new-user" />

      <section className="dashboard-main">
        <TopNavbar userName={session?.customerName ?? "New Customer"} balance={session?.availableBalance ?? "$0.00"} variant="new-user" />

        <section className="transactions-shell">
          <div className="transactions-header">
            <div>
              <p className="eyebrow">Account activity</p>
              <h1>Transaction history</h1>
              <p>No transfers have been made yet. Your activity will appear here once the account starts moving.</p>
            </div>
          </div>

          <div className="search-box">
            <input type="text" placeholder="Search by merchant, recipient or transaction ID..." />
          </div>

          <TransactionFilters />
          <TransactionStats variant="new-user" incoming={summary.incoming} outgoing={summary.outgoing} fees={summary.fees} count={summary.count} />
          <TransactionTable variant="new-user" basePath="/new-user" transactions={transactions} />
          <Pagination />
        </section>
      </section>
    </main>
  );
}
