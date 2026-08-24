type TransactionStatsProps = {
  variant?: "demo" | "new-user";
  incoming?: string;
  outgoing?: string;
  fees?: string;
  count?: number;
};

export default function TransactionStats({ variant = "demo", incoming, outgoing, fees, count }: TransactionStatsProps) {
  const stats = variant === "new-user"
    ? [
        { label: "Incoming", value: incoming ?? "$0.00", tone: "positive" },
        { label: "Outgoing", value: outgoing ?? "$0.00", tone: "negative" },
        { label: "Fees", value: fees ?? "$0.00", tone: "neutral" },
        { label: "Transactions", value: String(count ?? 0), tone: "neutral" },
      ]
    : [
        { label: "Incoming", value: incoming ?? "+$5,840", tone: "positive" },
        { label: "Outgoing", value: outgoing ?? "-$3,120", tone: "negative" },
        { label: "Fees", value: fees ?? "$42", tone: "neutral" },
        { label: "Transactions", value: String(count ?? 126), tone: "neutral" },
      ];

  return (
    <section className="stats-strip" aria-label="Transaction statistics">
      {stats.map((stat) => (
        <div key={stat.label} className={`stat-pill ${stat.tone}`}>
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
        </div>
      ))}
    </section>
  );
}
