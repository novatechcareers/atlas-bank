type TransactionStatsProps = {
  incoming: string;
  outgoing: string;
  fees: string;
  count: number;
};

export default function TransactionStats({ incoming, outgoing, fees, count }: TransactionStatsProps) {
  const stats = [
    { label: "Incoming", value: incoming, tone: "positive" },
    { label: "Outgoing", value: outgoing, tone: "negative" },
    { label: "Fees", value: fees, tone: "neutral" },
    { label: "Transactions", value: `${count}`, tone: "neutral" },
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
