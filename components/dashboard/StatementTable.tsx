type StatementRow = {
  period: string;
  generated: string;
  transactions: number;
  status: string;
};

type StatementTableProps = {
  rows: StatementRow[];
};

export default function StatementTable({ rows }: StatementTableProps) {
  return (
    <div className="statement-table-wrapper">
      <table className="statement-table">
        <thead>
          <tr>
            <th>Statement period</th>
            <th>Generated date</th>
            <th>Transactions</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.period}>
              <td>{row.period}</td>
              <td>{row.generated}</td>
              <td>{row.transactions}</td>
              <td>{row.status}</td>
              <td>
                <button className="secondary-btn" type="button">
                  Download PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
