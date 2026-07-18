"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import DashboardCard from "@/components/admin/DashboardCard";
import AdminFundAccount from "@/components/admin/AdminFundAccount";
import { getCustomers, loadLinkedCardsFromSupabase, loadTransferRequestsFromSupabase } from "@/lib/adminData";

export default function AdminDashboardPage() {
  const [transferCount, setTransferCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [linkedCardsCount, setLinkedCardsCount] = useState(0);

  useEffect(() => {
    const loadAdminStats = async () => {
      const transfers = await loadTransferRequestsFromSupabase(true);
      setTransferCount(transfers.length);
      setPendingCount(transfers.filter((item) => item.status === "Pending").length);
      const cards = await loadLinkedCardsFromSupabase(true);
      setLinkedCardsCount(cards.length);
    };

    loadAdminStats();
  }, []);

  return (
    <main className="dashboard-page admin-dashboard-page">
      <AdminSidebar />

      <section className="dashboard-main">
        <AdminTopbar title="Admin Dashboard" />

        <section className="admin-metrics-grid">
          <DashboardCard title="Customers" value={`${getCustomers().length}`} />
          <DashboardCard title="Transfer Requests" value={`${transferCount}`} />
          <DashboardCard title="Pending Transfers" value={`${pendingCount}`} />
          <DashboardCard title="Linked Cards" value={`${linkedCardsCount}`} />
        </section>

        <section className="admin-funding-section">
          <AdminFundAccount />
        </section>
      </section>
    </main>
  );
}
