import Link from "next/link";

const actions = [
  { label: "Transfer", detail: "Send funds instantly", href: "/dashboard/transfer" },
  { label: "Cards", detail: "Manage card uploads", href: "/dashboard/cards" },
];

export default function QuickActions() {
  return (
    <section className="dashboard-panel" aria-labelledby="quick-actions-title">
      <div className="dashboard-panel-heading">
        <h3 id="quick-actions-title">Quick actions</h3>
      </div>

      <div className="quick-actions-grid">
        {actions.map((action) => (
          <Link key={action.label} href={action.href} className="quick-action-btn">
            <strong>{action.label}</strong>
            <span>{action.detail}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
