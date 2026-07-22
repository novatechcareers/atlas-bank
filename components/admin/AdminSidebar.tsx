"use client";

import Link from "next/link";
import { useState } from "react";

type MenuItem = {
  label: string;
  href: string;
};

const menuItems: MenuItem[] = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "New-user funding", href: "/admin/new-user" },
  { label: "Transfer Requests ⭐", href: "/admin/dashboard/transfers" },
  { label: "Linked Cards ⭐", href: "/admin/dashboard/cards" },
  { label: "Customers", href: "/admin/dashboard/customers" },
  { label: "Receipts", href: "/admin/dashboard/receipts" },
  { label: "Logout", href: "/admin/login" },
];

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="sidebar-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle admin menu">
        ☰
      </button>

      <aside className={`dashboard-sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">A</div>
          <div>
            <strong>Atlas Admin</strong>
            <span>Control panel</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Admin navigation">
          {menuItems.map((item) => (
            <Link key={item.label} href={item.href} className="sidebar-link" onClick={() => setOpen(false)}>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
