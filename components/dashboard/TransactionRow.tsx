import Link from "next/link";
import { TransferRequest } from "@/lib/adminData";

type TransactionRowProps = TransferRequest;

function statusBadgeClass(status: string) {
  switch (status) {
    case "Approved":
      return "status-badge completed";
    case "Pending":
      return "status-badge pending";
    case "Declined":
      return "status-badge declined";
    default:
      return "status-badge";
  }
}

export default function TransactionRow({ submissionTime, description, recipient, amount, status, reference, direction = "outbound", bank }: TransactionRowProps) {
  const formattedAmount = `${direction === "incoming" ? "+" : "-"}$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const categoryLabel = direction === "incoming" ? "Incoming transfer" : "Outgoing transfer";

  return (
    <tr className="transaction-row">
      <td data-label="Date">{submissionTime}</td>
      <td data-label="Description">
        <div className="transaction-description">
          <strong>{description}</strong>
          <span>{categoryLabel} • {bank}</span>
        </div>
      </td>
      <td data-label="Recipient">{recipient}</td>
      <td data-label="Amount">{formattedAmount}</td>
      <td data-label="Status">
        <span className={statusBadgeClass(status)}>{status}</span>
      </td>
      <td data-label="Reference">{reference}</td>
      <td data-label="Action">
        <Link className="receipt-btn" href={`/dashboard/transactions/${reference}`}>
          View Receipt
        </Link>
      </td>
    </tr>
  );
}
