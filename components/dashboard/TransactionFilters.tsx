const accounts = ["All Accounts", "Checking", "Savings"];
const transactionTypes = ["All", "Transfer", "Salary", "Refund", "Other"];
const statuses = ["All", "Completed", "Pending", "Failed"];
const ranges = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "Custom"];

export default function TransactionFilters() {
  return (
    <section className="filters-panel" aria-label="Transaction filters">
      <div className="filter-group">
        <label htmlFor="account-filter">Account</label>
        <select id="account-filter" defaultValue="All Accounts">
          {accounts.map((account) => (
            <option key={account} value={account}>
              {account}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="type-filter">Transaction type</label>
        <select id="type-filter" defaultValue="All">
          {transactionTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="status-filter">Status</label>
        <select id="status-filter" defaultValue="Completed">
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="date-filter">Date range</label>
        <select id="date-filter" defaultValue="Last 30 Days">
          {ranges.map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
