type BalanceCardProps = {
  title: string;
  amount: string;
  icon: string;
  accent: string;
  accountNumber: string;
};

export default function BalanceCard({ title, amount, icon, accent, accountNumber }: BalanceCardProps) {
  return (
    <article className="balance-card" style={{ background: accent }}>
      <div className="balance-card-top">
        <div className="balance-meta">
          <span className="balance-icon" aria-hidden="true">
            {icon}
          </span>
          <div>
            <span className="balance-title">{title}</span>
            <p className="balance-subtitle">Account • {accountNumber}</p>
          </div>
        </div>
      </div>
      <div className="balance-amount-block">
        <strong>{amount}</strong>
        <span>Available now</span>
      </div>
      <div aria-hidden className="balance-watermark" />
    </article>
  );
}
