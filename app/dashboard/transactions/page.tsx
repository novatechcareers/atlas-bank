"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import TransactionStats from "@/components/dashboard/TransactionStats";
import TransactionFilters from "@/components/dashboard/TransactionFilters";
import TransactionTable from "@/components/dashboard/TransactionTable";
import Pagination from "@/components/dashboard/Pagination";
import { loadTransferRequestsFromSupabase, TransferRequest } from "@/lib/adminData";

export default function TransactionsPage() {
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  useEffect(() => {
    const loadTransfers = async () => {
      const records = await loadTransferRequestsFromSupabase(true);
      setTransfers(records);
    };

    loadTransfers();
  }, []);

  const pageCount = Math.max(1, Math.ceil(transfers.length / pageSize));

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount]);

  const displayedTransfers = useMemo(
    () => transfers.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [transfers, currentPage],
  );

  const incomingTotal = useMemo(
    () => transfers.reduce((sum, item) => sum + (item.direction === "incoming" ? item.amount : 0), 0),
    [transfers],
  );

  const outgoingTotal = useMemo(
    () => transfers.reduce((sum, item) => sum + (item.direction === "outbound" ? item.amount : 0), 0),
    [transfers],
  );

  const feesTotal = useMemo(
    () => transfers.reduce((sum, item) => sum + item.fee, 0),
    [transfers],
  );

  return (
    <main className="dashboard-page transactions-page">
      <Sidebar />

      <section className="dashboard-main">
        <TopNavbar userName="Daniel" />

        <section className="transactions-shell">
          <div className="transactions-header">
            <div>
              <p className="eyebrow">Account activity</p>
              <h1>Transaction history</h1>
              <p>Review all account activity and monitor your finances.</p>
            </div>
          </div>

          <div className="search-box">
            <input type="text" placeholder="Search by merchant, recipient or transaction ID..." />
          </div>

          <TransactionFilters />
          <TransactionStats
            incoming={`+$${incomingTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            outgoing={`-$${outgoingTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            fees={`$${feesTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            count={transfers.length}
          />
          <TransactionTable transactions={displayedTransfers} />
          <Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={setCurrentPage} />
        </section>
      </section>
    </main>
  );
}
