import TransactionRow from "@/components/dashboard/TransactionRow";
import type { TransferRequest } from "@/lib/adminData";

type DemoTransaction = {
  date: string;
  description: string;
  category: string;
  recipient: string;
  amount: string;
  status: "Completed" | "Pending" | "Failed";
  reference: string;
};

type TransactionTableProps = {
  variant?: "demo" | "new-user";
  basePath?: string;
  transactions?: Array<DemoTransaction | TransferRequest>;
};

const demoTransactions: DemoTransaction[] = [
  {
    date: "Jul 7",
    description: "Salary Deposit",
    category: "Salary",
    recipient: "Atlas Payroll",
    amount: "+$4,500.00",
    status: "Completed" as const,
    reference: "TXN-98452173",
  },
  {
    date: "Jul 6",
    description: "Netflix Subscription",
    category: "Entertainment",
    recipient: "Netflix",
    amount: "-$19.99",
    status: "Completed" as const,
    reference: "TXN-31095842",
  },
  {
    date: "Jul 5",
    description: "Electricity Bill",
    category: "Utilities",
    recipient: "ConEdison",
    amount: "-$82.40",
    status: "Completed" as const,
    reference: "TXN-87452018",
  },
  {
    date: "Jul 5",
    description: "Transfer",
    category: "Transfer",
    recipient: "Emily Carter",
    amount: "-$500.00",
    status: "Pending" as const,
    reference: "TXN-22314570",
  },
  {
    date: "Jul 4",
    description: "ATM Withdrawal",
    category: "Cash",
    recipient: "ATM",
    amount: "-$200.00",
    status: "Completed" as const,
    reference: "TXN-66128034",
  },
];

function formatTransactionRows(transactions: Array<DemoTransaction | TransferRequest>): DemoTransaction[] {
  return transactions.map((transaction) => {
    if ("customerName" in transaction) {
      const transfer = transaction as TransferRequest;
      const amountLabel = `${transfer.direction === "incoming" ? "+" : "-"}$${transfer.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      const statusLabel = transfer.status === "Approved" ? "Completed" : transfer.status === "Declined" ? "Failed" : "Pending";
      const shortDate = transfer.submissionTime ? transfer.submissionTime.split(" ")[0] : "—";

      return {
        date: shortDate,
        description: transfer.description || "Transfer",
        category: transfer.direction === "incoming" ? "Incoming" : "Transfer",
        recipient: transfer.recipient || transfer.customerName,
        amount: amountLabel,
        status: statusLabel as DemoTransaction["status"],
        reference: transfer.reference,
      } as DemoTransaction;
    }

    return transaction as DemoTransaction;
  });
}

export default function TransactionTable({ variant = "demo", basePath = "/dashboard", transactions: suppliedTransactions }: TransactionTableProps) {
  const transactions = suppliedTransactions ?? (variant === "new-user" ? [] : demoTransactions);
  const rows: DemoTransaction[] = formatTransactionRows(transactions);
  const receiptBasePath = basePath;

  if (variant === "new-user" && rows.length === 0) {
    return <div className="empty-state-card">No transactions have been made for this new account yet.</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Recipient</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Reference</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((transaction) => (
            <TransactionRow
              key={transaction.reference}
              date={transaction.date}
              description={transaction.description}
              category={transaction.category}
              recipient={transaction.recipient}
              amount={transaction.amount}
              status={transaction.status}
              reference={transaction.reference}
              basePath={receiptBasePath}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
