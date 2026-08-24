type AdminTopbarProps = {
  title?: string;
};

export default function AdminTopbar({ title = "Administrator Portal" }: AdminTopbarProps) {
  return (
    <header className="dashboard-topbar">
      <div>
        <p className="dashboard-topbar-label">Administrator access</p>
        <h2>{title}</h2>
      </div>

      <div className="dashboard-topbar-actions">
        <div className="topbar-pill">Admin mode</div>
        <button className="icon-button" type="button" aria-label="Notifications">
          🔔
        </button>
        <button className="icon-button" type="button" aria-label="Settings">
          ⚙️
        </button>
      </div>
    </header>
  );
}
