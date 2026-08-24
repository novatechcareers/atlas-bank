"use client";

import { useEffect, useState } from "react";
import { formatCurrency, getAvailableBalance, loadTransferRequestsFromSupabase } from "@/lib/adminData";

type TopNavbarProps = {
  userName?: string;
  balance?: string;
  variant?: "demo" | "new-user";
};

function getFallbackName(variant: "demo" | "new-user") {
  return variant === "new-user" ? "New Customer" : "Daniel Morgan";
}

export default function TopNavbar({ userName, balance, variant = "demo" }: TopNavbarProps) {
  const fallbackName = userName?.trim() || getFallbackName(variant);
  const fallbackBalance = balance ?? (variant === "new-user" ? "$0.00" : "$87,934");
  const [availableBalance, setAvailableBalance] = useState(fallbackBalance);
  const [displayName, setDisplayName] = useState(fallbackName);

  useEffect(() => {
    const syncNavbarState = async () => {
      await loadTransferRequestsFromSupabase(true);
      if (typeof window === "undefined") return;

      if (variant === "new-user") {
        try {
          const storedSession = window.localStorage.getItem("atlasNewUserSession");
          if (storedSession) {
            const parsed = JSON.parse(storedSession) as { customerName?: string; availableBalance?: string };
            const nextName = parsed.customerName?.trim() || userName?.trim() || getFallbackName(variant);
            setDisplayName(nextName);
            if (parsed.availableBalance) {
              setAvailableBalance(parsed.availableBalance);
              return;
            }
          }
        } catch {
          // fall back to the prop-driven values below
        }
        setDisplayName(userName?.trim() || getFallbackName(variant));
        setAvailableBalance(balance ?? "$0.00");
        return;
      }

      const storedName = window.localStorage.getItem("customerName")?.trim();
      const nextName = userName?.trim() || storedName || getFallbackName(variant);
      setDisplayName(nextName);

      setAvailableBalance(formatCurrency(getAvailableBalance()));
    };

    syncNavbarState();
  }, [balance, userName, variant]);

  const initials = displayName
    .split(" ")
    .map((segment) => segment.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const greeting = variant === "new-user" ? "Welcome" : "Welcome back";

  return (
    <header className="dashboard-topbar">
      <div>
        <p className="dashboard-topbar-label">Portfolio overview</p>
        <h2>{greeting}, {displayName}</h2>
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
