"use client";

import { useEffect, useState } from "react";
import { formatCurrency, getAvailableBalance, loadTransferRequestsFromSupabase } from "@/lib/adminData";

type TopNavbarProps = {
  userName?: string;
};

export default function TopNavbar({ userName }: TopNavbarProps) {
  const [availableBalance, setAvailableBalance] = useState("$87,934");
  const [displayName, setDisplayName] = useState(userName ?? "Daniel Morgan");

  useEffect(() => {
    const loadBalance = async () => {
      await loadTransferRequestsFromSupabase(true);
      if (typeof window === "undefined") return;
      setAvailableBalance(formatCurrency(getAvailableBalance()));
      setDisplayName(window.localStorage.getItem("customerName") ?? userName ?? "Daniel Morgan");
    };

    loadBalance();
  }, [userName]);

  const initials = displayName
    .split(" ")
    .map((segment) => segment.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="dashboard-topbar">
      <div>
        <p className="dashboard-topbar-label">Portfolio overview</p>
        <h2>Welcome back, {userName}</h2>
      </div>

      <div className="dashboard-topbar-actions">
        <div className="topbar-pill">Balance {availableBalance}</div>
        <button className="icon-button" type="button" aria-label="Notifications">
          🔔
        </button>
        <button className="icon-button" type="button" aria-label="Messages">
          ✉
        </button>
        <div className="profile-pill">
          <div className="profile-avatar">{initials}</div>
          <span>{displayName}</span>
          <span className="profile-arrow">▾</span>
        </div>
      </div>
    </header>
  );
}
