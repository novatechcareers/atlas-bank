"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import { getNewUserSession, loadNewUserReceipts, type NewUserReceipt } from "@/lib/newUserData";

export default function NewUserReceiptPage() {
  const params = useParams();
  const reference = params?.reference as string;
  const [receipt, setReceipt] = useState<NewUserReceipt | null>(null);
  const [session, setSession] = useState(() => getNewUserSession());

  useEffect(() => {
    let isMounted = true;

    async function loadReceipt() {
      if (!reference) return;
      const receipts = await loadNewUserReceipts(session?.customerName);
      if (isMounted) {
        setReceipt(receipts.find((item) => item.reference === reference) ?? null);
      }
    }

    loadReceipt();

    const handleTransfersUpdated = () => {
      void loadReceipt();
    };

    window.addEventListener("atlas-new-user-transfers-updated", handleTransfersUpdated);
    window.addEventListener("storage", handleTransfersUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("atlas-new-user-transfers-updated", handleTransfersUpdated);
      window.removeEventListener("storage", handleTransfersUpdated);
    };
  }, [reference, session]);

  if (!receipt) {
    return (
      <main className="dashboard-page transactions-page">
        <Sidebar basePath="/new-user" />
        <section className="dashboard-main">
          <TopNavbar userName="New Customer" balance="$0.00" variant="new-user" />
          <div className="transactions-shell">
            <div className="transactions-header">
              <div>
                <p className="eyebrow">Receipt</p>
                <h1>Receipt not found</h1>
                <p>No receipt exists for this transaction reference.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page transactions-page">
      <Sidebar basePath="/new-user" />
      <section className="dashboard-main">
        <TopNavbar userName={session?.customerName ?? "New Customer"} balance={session?.availableBalance ?? "$0.00"} variant="new-user" />
        <section className="transactions-shell">
          <div className="transactions-header">
            <div>
              <p className="eyebrow">Transfer receipt</p>
              <h1>Receipt {receipt.reference}</h1>
              <p>Review the details for this transaction.</p>
            </div>
          </div>

          <div className="receipt-panel receipt-panel--professional">
            {receipt.status === "DECLINED" ? (
              <div style={{ border: "2px solid #dc2626", background: "#fef2f2", padding: "1rem", marginBottom: "1rem", borderRadius: "0.9rem" }}>
                <p className="eyebrow" style={{ color: "#991b1b", marginBottom: "0.25rem" }}>Declined</p>
                <strong style={{ color: "#991b1b", fontSize: "1.05rem", display: "block" }}>This transfer was declined and no funds were removed from your account.</strong>
                {receipt.declinedReason ? <p style={{ marginTop: "0.5rem", color: "#7f1d1d" }}>{receipt.declinedReason}</p> : null}
              </div>
            ) : null}
            <div className="receipt-panel-header">
              <div>
                <p className="eyebrow receipt-status">Status</p>
                <strong className={`receipt-status-badge receipt-status-${receipt.status.toLowerCase()}`}>
                  {receipt.status === "SUCCESSFUL" ? "Successful" : receipt.status === "PENDING" ? "Pending" : "Declined"}
                </strong>
              </div>
              <div className="receipt-reference">
                <span>Receipt ID</span>
                <strong>{receipt.reference}</strong>
              </div>
            </div>

            <div className="receipt-row">
              <span>Transaction date</span>
              <strong>{receipt.date}</strong>
            </div>
            <div className="receipt-row">
              <span>Processed by</span>
              <strong>{receipt.adminName ?? "Atlas Bank"}</strong>
            </div>
            {receipt.approvalDate ? (
              <div className="receipt-row">
                <span>Processed on</span>
                <strong>{receipt.approvalDate}</strong>
              </div>
            ) : null}
            <div className="receipt-divider" />
            <div className="receipt-row">
              <span>Sender</span>
              <strong>{receipt.senderName}</strong>
            </div>
            <div className="receipt-row">
              <span>Sender account</span>
              <strong>{receipt.senderAccount}</strong>
            </div>
            <div className="receipt-row">
              <span>Recipient</span>
              <strong>{receipt.recipientName}</strong>
            </div>
            <div className="receipt-row">
              <span>Recipient bank</span>
              <strong>{receipt.recipientBank}</strong>
            </div>
            <div className="receipt-row">
              <span>Recipient account</span>
              <strong>{receipt.recipientAccount}</strong>
            </div>
            <div className="receipt-row">
              <span>Bank SWIFT</span>
              <strong>{receipt.swift ?? "N/A"}</strong>
            </div>
            <div className="receipt-row">
              <span>Payment note</span>
              <strong>{receipt.description ?? "Funds transfer"}</strong>
            </div>
            <div className="receipt-divider" />
            <div className="receipt-row receipt-row--amount">
              <span>Transfer amount</span>
              <strong>${receipt.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
            <div className="receipt-row">
              <span>Service fee</span>
              <strong>${receipt.fee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
            <div className="receipt-row receipt-row--total">
              <span>Total debited</span>
              <strong>${receipt.totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
            {receipt.status === "DECLINED" ? (
              <div className="receipt-row receipt-row--decline-note">
                <span>Notes</span>
                <strong>No funds were withdrawn from the account because this transfer was declined.</strong>
              </div>
            ) : null}
            {receipt.declinedReason ? (
              <>
                <div className="receipt-divider" />
                <div className="receipt-row receipt-row--decline">
                  <span>Decline reason</span>
                  <strong>{receipt.declinedReason}</strong>
                </div>
              </>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}
