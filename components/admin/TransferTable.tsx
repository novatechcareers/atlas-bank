import type { TransferRequest } from "@/lib/adminData";

type TransferTableProps = {
  items: TransferRequest[];
  onView: (item: TransferRequest) => void;
};

export default function TransferTable({ items, onView }: TransferTableProps) {
  return (
    <div className="statement-table-wrapper">
      <table className="statement-table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Customer</th>
            <th>Recipient</th>
            <th>Bank</th>
            <th>Amount</th>
            <th>Fee</th>
            <th>Status</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.reference}>
              <td>{item.reference}</td>
              <td>{item.customerName}</td>
              <td>{item.recipient}</td>
              <td>{item.bank}</td>
              <td>${item.amount.toFixed(2)}</td>
              <td>${item.fee.toFixed(2)}</td>
              <td>{item.status}</td>
              <td>{item.submissionTime}</td>
              <td>
                <button className="secondary-btn" type="button" onClick={() => onView(item)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
