"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import QuickActions from "@/components/dashboard/QuickActions";
import TransactionList from "@/components/dashboard/TransactionList";
import { formatCurrency, getAvailableBalance, refreshBankDataFromSupabase } from "@/lib/adminData";

export default function DashboardPage() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("Daniel Morgan");
  const [accountNumber, setAccountNumber] = useState("4589201834");
  const [customerId, setCustomerId] = useState("ATB-102938");
  const [accountType, setAccountType] = useState("Atlas Premier Checking");
  const [availableBalance, setAvailableBalance] = useState("$87,934");
  const [status, setStatus] = useState("Verified");

  useEffect(() => {
    const loadDashboard = async () => {
      await refreshBankDataFromSupabase(true);
      if (typeof window === "undefined") return;

      setCustomerName(window.localStorage.getItem("customerName") ?? "Daniel Morgan");
      setAccountNumber(window.localStorage.getItem("accountNumber") ?? "4589201834");
      setCustomerId(window.localStorage.getItem("customerId") ?? "ATB-102938");
      setAccountType(window.localStorage.getItem("accountType") ?? "Atlas Premier Checking");
      setAvailableBalance(formatCurrency(getAvailableBalance()));
      setStatus(window.localStorage.getItem("status") ?? "Verified");
    };

    loadDashboard();
  }, []);

  return (
    <main className="dashboard-page">
      <Sidebar />

      <section className="dashboard-main">
        <TopNavbar userName={customerName} />

        <div className="dashboard-hero-card">
          <div className="dashboard-hero-copy">
            <p className="eyebrow">Private banking</p>
            <h1>Your Atlas Premier checking at a glance.</h1>
            <p>
              Track your available funds and account details from a cleaner, more focused dashboard designed for real transfer activity.
            </p>
          </div>

          <div className="hero-balance-panel">
            <div className="hero-balance-header">
              <span>Available balance</span>
              <strong>{availableBalance}</strong>
            </div>

            <div className="hero-account-summary hero-account-summary-dashboard">
              <div>
                <strong>Account Number</strong>
                <span>{accountNumber}</span>
              </div>
              <div>
                <strong>Customer ID</strong>
                <span>{customerId}</span>
              </div>
              <div>
                <strong>Account Type</strong>
                <span>{accountType}</span>
              </div>
              <div>
                <strong>Status</strong>
                <span>{status}</span>
              </div>
            </div>

            <button className="primary-btn" type="button" onClick={() => router.push("/dashboard/transfer")}>
              Transfer money
            </button>
          </div>
        </div>

        <section className="dashboard-content-grid">
          <QuickActions />
          <TransactionList />
        </section>
      </section>
    </main>
  );
}
