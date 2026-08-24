type DashboardCardProps = {
  title: string;
  value: string;
  accent?: string;
};

export default function DashboardCard({ title, value, accent = "linear-gradient(135deg, #1e3a8a, #2563eb)" }: DashboardCardProps) {
  return (
    <article className="dashboard-card" style={{ background: accent }}>
      <span>{title}</span>
      <strong>{value}</strong>
    </article>
  );
}
