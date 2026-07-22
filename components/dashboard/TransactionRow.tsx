import Link from "next/link";

type TransactionRowProps = {
  date: string;
  description: string;
  category: string;
  recipient: string;
  amount: string;
  status: "Completed" | "Pending" | "Failed";
  reference: string;
  basePath?: string;
};

function statusBadgeClass(status: string) {
  switch (status) {
    case "Completed":
      return "status-badge completed";
    case "Pending":
      return "status-badge pending";
    case "Failed":
      return "status-badge failed";
    default:
      return "status-badge";
  }
}

export default function TransactionRow({ date, description, category, recipient, amount, status, reference, basePath }: TransactionRowProps) {
  return (
    <tr className="transaction-row">
      <td data-label="Date">{date}</td>
      <td data-label="Description">
        <div className="transaction-description">
          <strong>{description}</strong>
          <span>{category}</span>
        </div>
      </td>
      <td data-label="Recipient">{recipient}</td>
      <td data-label="Amount">{amount}</td>
      <td data-label="Status">
        <span className={statusBadgeClass(status)}>{status}</span>
      </td>
      <td data-label="Reference">{reference}</td>
      <td data-label="Action">
        {basePath ? (
          <Link href={`${basePath}/transactions/${reference}`} className="receipt-btn">
            View Receipt
          </Link>
        ) : (
          <button className="receipt-btn receipt-btn--disabled" type="button" disabled>
            View Receipt
          </button>
        )}
      </td>
    </tr>
  );
}
