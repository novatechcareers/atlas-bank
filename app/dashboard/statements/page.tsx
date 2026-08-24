"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import StatementSummary from "@/components/dashboard/StatementSummary";
import StatementTable from "@/components/dashboard/StatementTable";
import CustomerCareModal from "@/components/dashboard/CustomerCareModal";
import { formatCurrency, getAvailableBalance, getDemoTransferRequests } from "@/lib/adminData";

const statementRows = [
  { period: "July 2026", generated: "Jul 31", transactions: 146, status: "Available" },
  { period: "June 2026", generated: "Jun 30", transactions: 151, status: "Available" },
  { period: "May 2026", generated: "May 31", transactions: 138, status: "Available" },
];

const filters = ["Current Month", "Last Month", "Last 3 Months", "Last 6 Months", "Last Year"];
const initialSummaryValues = {
  currentBalance: formatCurrency(89768.82),
  credits: formatCurrency(0),
  debits: formatCurrency(0),
};

export default function StatementsPage() {
  const [selectedFilter, setSelectedFilter] = useState(filters[0]);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [summaryValues, setSummaryValues] = useState(initialSummaryValues);

  useEffect(() => {
    const transfers = getDemoTransferRequests();
    const credits = transfers.reduce((sum, item) => {
      if (item.status === "Approved" && item.direction === "incoming") return sum + item.amount;
      return sum;
    }, 0);
    const debits = transfers.reduce((sum, item) => {
      if (item.status === "Approved" && item.direction === "outbound") return sum + item.totalDebit;
      return sum;
    }, 0);

    setSummaryValues({
      currentBalance: formatCurrency(getAvailableBalance()),
      credits: formatCurrency(credits),
      debits: formatCurrency(debits),
    });
  }, []);

  return (
    <main className="dashboard-page statements-page">
      <Sidebar />

      <section className="dashboard-main">
        <TopNavbar userName="Daniel" />

        <section className="statements-shell">
          <div className="statements-header">
            <div>
              <p className="eyebrow">Bank statements</p>
              <h1>Account Statements</h1>
              <p>View and download your official bank statements.</p>
            </div>
          </div>

          <div className="statement-summary-grid">
            <StatementSummary label="Total Balance" value={summaryValues.currentBalance} />
            <StatementSummary label="Credits" value={summaryValues.credits} />
            <StatementSummary label="Debits" value={summaryValues.debits} />
          </div>

          <div className="statement-filter-panel">
            <div>
              <p className="eyebrow">Filter statements</p>
              <h2>Choose a date range</h2>
            </div>
            <select value={selectedFilter} onChange={(event) => setSelectedFilter(event.target.value)}>
              {filters.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <StatementTable rows={statementRows} />

          <div className="statement-actions">
            <button className="secondary-btn" type="button" onClick={() => setShowSupportModal(true)}>
              Download selected PDF
            </button>
            <button className="primary-btn" type="button" onClick={() => setShowSupportModal(true)}>
              Download statement bundle
            </button>
          </div>

          <CustomerCareModal
            open={showSupportModal}
            onClose={() => setShowSupportModal(false)}
            title="Statement delivery request"
            body="Please contact customer care to receive your selected PDF or statement bundle."
          />
        </section>
      </section>
    </main>
  );
}
