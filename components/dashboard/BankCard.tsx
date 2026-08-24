type BankCardProps = {
  cardHolder?: string;
  cardNumber?: string;
  showReview?: boolean;
  frontImageSrc?: string;
};

export default function BankCard({ cardHolder = "Atlas Bank", cardNumber = "**** **** **** ****", showReview = false, frontImageSrc }: BankCardProps) {
  const cardStyle = frontImageSrc
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(7, 21, 42, 0.82), rgba(9, 28, 53, 0.82)), url(${frontImageSrc})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  return (
    <article className="bank-card" aria-label="Premium bank card preview" style={cardStyle}>
      <div className="bank-card-top">
        <div className="bank-card-brand">ATLAS BANK</div>
        <div className="bank-card-logo">VISA</div>
      </div>

      <div className="bank-card-chip" aria-hidden="true" />

      <p className="bank-card-number">{cardNumber}</p>

      <div className="bank-card-meta">
        <span>{cardHolder}</span>
        {showReview && <strong>LOADING....</strong>}
      </div>

      {showReview && <div className="bank-card-status">UNDER REVIEW</div>}
    </article>
  );
}
