type TransferSummaryProps = {
  amount: string;
  recipient: string;
  account: string;
  arrival: string;
  transferType: string;
  totalDebit: string;
  currentBalance: string;
  remainingBalance: string;
};

export default function TransferSummary({ amount, recipient, account, arrival, transferType, totalDebit, currentBalance, remainingBalance }: TransferSummaryProps) {
  return (
    <aside className="transfer-summary-card" aria-label="Transfer summary">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Review before you proceed</p>
          <h3>Transfer summary</h3>
        </div>
      </div>

      <div className="summary-list">
        <div className="summary-row">
          <span>Amount</span>
          <strong>{amount}</strong>
        </div>
        <div className="summary-row">
          <span>Recipient</span>
          <strong>{recipient}</strong>
        </div>
        <div className="summary-row">
          <span>Recipient account</span>
          <strong>{account}</strong>
        </div>
        <div className="summary-row">
          <span>Transfer type</span>
          <strong>{transferType}</strong>
        </div>
        <div className="summary-row">
          <span>Estimated arrival</span>
          <strong>{arrival}</strong>
        </div>
        <div className="summary-row">
          <span>Total debit</span>
          <strong>{totalDebit}</strong>
        </div>
        <div className="summary-row">
          <span>Current balance</span>
          <strong>{currentBalance}</strong>
        </div>
        <div className="summary-row">
          <span>Remaining balance</span>
          <strong>{remainingBalance}</strong>
        </div>
      </div>
    </aside>
  );
}
