type StatisticCardProps = {
  value: string;
  label: string;
};

export default function StatisticCard({ value, label }: StatisticCardProps) {
  return (
    <article className="stat-card" role="listitem">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}
