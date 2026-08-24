"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import StatementSummary from "@/components/dashboard/StatementSummary";
import StatementTable from "@/components/dashboard/StatementTable";
import CustomerCareModal from "@/components/dashboard/CustomerCareModal";
import { getNewUserSession, loadNewUserTransfers, type NewUserAccount, type NewUserTransfer } from "@/lib/newUserData";

const defaultStatementRows = [
  { period: "Current Statement", generated: "Pending", transactions: 0, status: "Available" },
];

const filters = ["Current Month", "Last Month", "Last 3 Months"];

export default function NewUserStatementsPage() {
  const [selectedFilter, setSelectedFilter] = useState(filters[0]);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [session, setSession] = useState<NewUserAccount | null>(null);
  const [summary, setSummary] = useState({ totalBalance: "$0.00", credits: "$0.00", debits: "$0.00" });
  const [statementRows, setStatementRows] = useState(defaultStatementRows);

  useEffect(() => {
    const storedSession = getNewUserSession();
    setSession(storedSession);

    loadNewUserTransfers(storedSession?.customerEmail)
      .then((loaded) => {
        const credits = loaded
          .filter((transfer) => transfer.direction === "incoming" && transfer.status === "Approved")
          .reduce((sum, transfer) => sum + transfer.amount, 0);
        const debits = loaded
          .filter((transfer) => transfer.direction === "outbound" && transfer.status === "Approved")
          .reduce((sum, transfer) => sum + transfer.totalDebit, 0);

        setSummary({
          totalBalance: storedSession?.availableBalance ?? "$0.00",
          credits: `$${credits.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          debits: `$${debits.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        });

        setStatementRows([
          {
            period: "Current Statement",
            generated: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            transactions: loaded.length,
            status: loaded.length > 0 ? "Available" : "Pending",
          },
        ]);
      })
      .catch(() => {
        setSummary({
          totalBalance: storedSession?.availableBalance ?? "$0.00",
          credits: "$0.00",
          debits: "$0.00",
        });
      });
  }, []);

  return (
    <main className="dashboard-page statements-page">
      <Sidebar basePath="/new-user" />

      <section className="dashboard-main">
        <TopNavbar userName={session?.customerName ?? "New Customer"} balance={session?.availableBalance ?? "$0.00"} variant="new-user" />

        <section className="statements-shell">
          <div className="statements-header">
            <div>
              <p className="eyebrow">Bank statements</p>
              <h1>Account Statements</h1>
              <p>Statements will appear here as soon as funds begin to move for this new account.</p>
            </div>
          </div>

          <div className="statement-summary-grid">
            <StatementSummary label="Total Balance" value={summary.totalBalance} />
            <StatementSummary label="Credits" value={summary.credits} />
            <StatementSummary label="Debits" value={summary.debits} />
          </div>

          <div className="statement-filter-panel">
            <div>
              <p className="eyebrow">Filter statements</p>
              <h2>Choose a date range</h2>
            </div>
            <select value={selectedFilter} onChange={(event) => setSelectedFilter(event.target.value)}>
              {filters.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <StatementTable rows={statementRows} />

          <div className="statement-actions">
            <button className="secondary-btn" type="button" onClick={() => setShowSupportModal(true)}>Download selected PDF</button>
            <button className="primary-btn" type="button" onClick={() => setShowSupportModal(true)}>Download statement bundle</button>
          </div>

          <CustomerCareModal open={showSupportModal} onClose={() => setShowSupportModal(false)} title="Statement delivery request" body="Please contact customer care to receive your selected PDF or statement bundle." />
        </section>
      </section>
    </main>
  );
}
