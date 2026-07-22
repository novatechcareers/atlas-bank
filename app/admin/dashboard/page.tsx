"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import DashboardCard from "@/components/admin/DashboardCard";
import AdminFundAccount from "@/components/admin/AdminFundAccount";
import { getCustomers, loadLinkedCardsFromSupabase, loadTransferRequestsFromSupabase } from "@/lib/adminData";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { fetchRegisteredNewUsers } from "@/lib/newUserData";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [transferCount, setTransferCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [linkedCardsCount, setLinkedCardsCount] = useState(0);
  const [registeredUsers, setRegisteredUsers] = useState<Array<{ email: string; fullName: string; phone?: string }>>([]);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.replace("/admin/login");
      return;
    }

    const loadAdminStats = async () => {
      const transfers = await loadTransferRequestsFromSupabase(true);
      setTransferCount(transfers.length);
      setPendingCount(transfers.filter((item) => item.status === "Pending").length);
      const cards = await loadLinkedCardsFromSupabase(true);
      setLinkedCardsCount(cards.length);
      setRegisteredUsers(await fetchRegisteredNewUsers());
    };

    loadAdminStats();
  }, [router]);

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
          <div className="admin-users-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Registered new-users</p>
                <h3>Available recipients for funding</h3>
              </div>
            </div>
            {registeredUsers.length ? (
              <ul className="admin-user-list">
                {registeredUsers.map((user) => (
                  <li key={user.email}>
                    <strong>{user.fullName}</strong>
                    <span>{user.email}</span>
                    {user.phone ? <small>{user.phone}</small> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="settings-note">No registered new-users found yet.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
