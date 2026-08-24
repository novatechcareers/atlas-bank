"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminNewUserFundAccount from "@/components/admin/AdminNewUserFundAccount";
import { fetchRegisteredNewUsers, loadNewUserTransfers, updateNewUserTransferStatus, type NewUserTransfer } from "@/lib/newUserData";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export default function AdminNewUserFundingPage() {
  const router = useRouter();
  const [registeredUsers, setRegisteredUsers] = useState<Array<{ email: string; fullName: string; phone?: string }>>([]);
  const [transactions, setTransactions] = useState<NewUserTransfer[]>([]);
  const [message, setMessage] = useState("");
  const [declineReasons, setDeclineReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.replace("/admin/login");
      return;
    }

    const loadData = async () => {
      setRegisteredUsers(await fetchRegisteredNewUsers());
      setTransactions(await loadNewUserTransfers());
    };

    loadData();
  }, [router]);

  const handleStatusChange = async (reference: string, status: "Approved" | "Declined") => {
    const reason = status === "Declined" ? (declineReasons[reference] ?? "").trim() || "Flagged by admin" : undefined;
    const updated = await updateNewUserTransferStatus(reference, status, "Admin User", reason);
    if (updated) {
      setTransactions((current) => current.map((item) => (item.reference === reference ? updated : item)));
      setMessage(status === "Approved" ? "New-user transfer approved." : "New-user transfer declined.");
    }
  };

  return (
    <main className="dashboard-page admin-dashboard-page">
      <AdminSidebar />

      <section className="dashboard-main">
        <AdminTopbar title="New-user funding" />

        <section className="admin-metrics-grid">
          <div className="admin-funding-section">
            <AdminNewUserFundAccount />
          </div>

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

            <div className="panel-heading" style={{ marginTop: "1.25rem" }}>
              <div>
                <p className="eyebrow">New-user transfer queue</p>
                <h3>Approve or decline transfers</h3>
              </div>
            </div>
            {message ? <p className="settings-note">{message}</p> : null}
            {transactions.length ? (
              <ul className="admin-user-list">
                {transactions.map((transaction) => (
                  <li key={transaction.reference}>
                    <strong>{transaction.recipient}</strong>
                    <span>{transaction.description || "New-user transfer"}</span>
                    <small>{transaction.status} • ${transaction.amount.toFixed(2)}</small>
                    {transaction.status === "Pending" ? (
                      <div style={{ marginTop: "0.75rem" }}>
                        <div className="field-group" style={{ marginBottom: "0.5rem" }}>
                          <label htmlFor={`decline-reason-${transaction.reference}`}>Decline reason</label>
                          <textarea
                            id={`decline-reason-${transaction.reference}`}
                            rows={2}
                            value={declineReasons[transaction.reference] ?? ""}
                            onChange={(event) => setDeclineReasons((current) => ({ ...current, [transaction.reference]: event.target.value }))}
                            placeholder="Enter the reason for decline"
                          />
                        </div>
                        <div className="form-actions">
                          <button className="primary-btn" type="button" onClick={() => handleStatusChange(transaction.reference, "Approved")}>Approve</button>
                          <button className="secondary-btn" type="button" onClick={() => handleStatusChange(transaction.reference, "Declined")}>Send decline</button>
                        </div>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="settings-note">No new-user transfers have been created yet.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
