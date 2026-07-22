"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import QuickActions from "@/components/dashboard/QuickActions";
import TransactionList from "@/components/dashboard/TransactionList";
import { getNewUserSession, refreshNewUserSessionBalance, type NewUserAccount } from "@/lib/newUserData";

export default function NewUserDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<NewUserAccount | null>(null);
  const [showProfileNotice, setShowProfileNotice] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const storedSession = await refreshNewUserSessionBalance();
      if (storedSession) {
        setSession(storedSession);
        if (!storedSession.profileCompleted) {
          setShowProfileNotice(true);
        }
        return;
      }

      const fallbackSession = getNewUserSession();
      if (fallbackSession && !fallbackSession.profileCompleted) {
        setShowProfileNotice(true);
      }
      setSession(fallbackSession);
    };

    loadSession();
  }, []);

  const heroLabel = useMemo(
    () => (session?.customerName && session.customerName !== "New Customer" ? `Welcome, ${session.customerName}` : "Welcome, new customer"),
    [session?.customerName]
  );

  return (
    <main className="dashboard-page">
      <Sidebar basePath="/new-user" />

      <section className="dashboard-main">
        <TopNavbar userName={session?.customerName} balance={session?.availableBalance} variant="new-user" />

        {showProfileNotice ? (
          <div className="profile-notice-banner" role="status">
            <span>Profile update recommended</span>
            <p>Complete your personal details from the profile page to keep your card and account setup moving smoothly.</p>
            <button className="secondary-btn" type="button" onClick={() => setShowProfileNotice(false)}>
              OK
            </button>
          </div>
        ) : null}

        <div className="dashboard-hero-card">
          <div className="dashboard-hero-copy">
            <p className="eyebrow">New customer onboarding</p>
            <h1>{heroLabel}</h1>
            <p>Your account has just started. Funds and activity will appear here when your first transfer is processed.</p>
          </div>

          <div className="hero-balance-panel">
            <div className="hero-balance-header">
              <span>Available balance</span>
              <strong>{session?.availableBalance ?? "$0.00"}</strong>
            </div>

            <div className="hero-account-summary hero-account-summary-dashboard">
              <div>
                <strong>Account Number</strong>
                <span>{session?.accountNumber ?? "ACCT-0000000000"}</span>
              </div>
              <div>
                <strong>Customer ID</strong>
                <span>{session?.customerId ?? "CUST-000000"}</span>
              </div>
              <div>
                <strong>Account Type</strong>
                <span>{session?.accountType ?? "Atlas New Customer"}</span>
              </div>
              <div>
                <strong>Status</strong>
                <span>{session?.status ?? "Active"}</span>
              </div>
            </div>

            <button className="primary-btn" type="button" onClick={() => router.push("/new-user/transfer")}>
              Transfer money
            </button>
          </div>
        </div>

        <section className="dashboard-content-grid">
          <QuickActions basePath="/new-user" />
          <TransactionList variant="new-user" basePath="/new-user" />
        </section>
      </section>

    </main>
  );
}
