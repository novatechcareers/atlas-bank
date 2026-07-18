import TransactionRow from "@/components/dashboard/TransactionRow";
import { TransferRequest } from "@/lib/adminData";

type TransactionTableProps = {
  transactions: TransferRequest[];
};

export default function TransactionTable({ transactions }: TransactionTableProps) {
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
          {transactions.map((transaction) => (
            <TransactionRow key={transaction.reference} {...transaction} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
