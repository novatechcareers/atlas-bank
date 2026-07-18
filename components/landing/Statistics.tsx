import StatisticCard from "@/components/landing/StatisiticCard";

const statistics = [
  {
    value: "2.4M+",
    label: "Customers Worldwide",
  },
  {
    value: "120+",
    label: "Countries Supported",
  },
  {
    value: "$850M",
    label: "Transferred Daily",
  },
  {
    value: "99.99%",
    label: "System Availability",
  },
];

export default function Statistics() {
  return (
    <section className="stats-section" aria-labelledby="statistics-title">
      <div className="section-heading statistics-heading">
        <p className="eyebrow">Trusted Around The World</p>
        <h2 id="statistics-title">
          Atlas Bank serves millions of customers with secure, reliable, and
          truly modern banking.
        </h2>
      </div>

      <div className="stats-grid" role="list" aria-label="Atlas Bank statistics">
        {statistics.map((stat) => (
          <StatisticCard key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </div>
    </section>
  );
}
