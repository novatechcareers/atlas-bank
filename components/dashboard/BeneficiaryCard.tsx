type BeneficiaryCardProps = {
  name: string;
  bank: string;
  account: string;
};

export default function BeneficiaryCard({ name, bank, account }: BeneficiaryCardProps) {
  return (
    <button className="beneficiary-card" type="button">
      <div>
        <strong>{name}</strong>
        <p>{bank}</p>
      </div>
      <span>{account}</span>
    </button>
  );
}
