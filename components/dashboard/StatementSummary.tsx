type StatementSummaryProps = {
  label: string;
  value: string;
};

export default function StatementSummary({ label, value }: StatementSummaryProps) {
  return (
    <article className="statement-summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
