"use client";

import Link from "next/link";
import { useState } from "react";

type MenuItem = {
  label: string;
  href: string;
};

const menuItems: MenuItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Transfer Money", href: "/dashboard/transfer" },
  { label: "Transactions", href: "/dashboard/transactions" },
  { label: "Cards", href: "/dashboard/cards" },
  { label: "Statements", href: "/dashboard/statements" },
  { label: "Profile", href: "/dashboard/profile" },
  { label: "Settings", href: "/dashboard/settings" },
  { label: "Logout", href: "/auth/login" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="sidebar-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle dashboard menu">
        ☰
      </button>

      <aside className={`dashboard-sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <img className="sidebar-brand-logo" src="/logos/atlas-logo-light.jpg" alt="Atlas logo" />
          <div>
            <strong>Atlas Premier</strong>
            <span>Premier banking</span>
          </div>
        </div>

        <div className="sidebar-badge">
          <span>Wealth profile</span>
          <strong>Premium</strong>
        </div>

        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`sidebar-link ${item.label === "Dashboard" ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
