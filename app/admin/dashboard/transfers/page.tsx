"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import TransferTable from "@/components/admin/TransferTable";
import TransferDetails from "@/components/admin/TransferDetails";
import { loadTransferRequestsFromSupabase, TransferRequest } from "@/lib/adminData";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export default function AdminTransfersPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<TransferRequest | null>(null);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.replace("/admin/login");
      return;
    }

    const loadTransfers = async () => {
      const records = await loadTransferRequestsFromSupabase(true);
      setTransferRequests(records);
    };

    loadTransfers();
  }, [router]);

  return (
    <main className="dashboard-page admin-dashboard-page">
      <AdminSidebar />

      <section className="dashboard-main">
        <AdminTopbar title="Transfer Requests" />

        <section className="admin-transfer-shell">
          <div>
            <TransferTable items={transferRequests} onView={setSelected} />
          </div>

          {selected ? <TransferDetails request={selected} onClose={() => setSelected(null)} /> : null}
        </section>
      </section>
    </main>
  );
}
