"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createTransferRequest, getAvailableBalance } from "@/lib/adminData";
import TransferSummary from "@/components/dashboard/TransferSummary";

const banks = [
  "Atlas Bank",
  "JPMorgan Chase",
  "Bank of America",
  "Wells Fargo",
  "Citibank",
  "HSBC",
  "Barclays",
  "Santander",
  "Deutsche Bank",
  "Standard Chartered",
];

const transferTypes = ["Internal Transfer", "Domestic Transfer", "International Wire"];

export default function TransferForm() {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routing, setRouting] = useState("");
  const [type, setType] = useState("Domestic Transfer");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const parsedAmount = Number.parseFloat(amount.replace(/[^\d.]/g, "")) || 0;
  const fee = 0;
  const totalDebit = parsedAmount;
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const remainingBalance = currentBalance - totalDebit;
  const isAccountNumberValid = /^\d{10,12}$/.test(accountNumber);
  const isFormValid = Boolean(amount.trim()) && Boolean(recipient.trim()) && Boolean(bank) && isAccountNumberValid && parsedAmount > 0;
  const maskedAccountNumber = accountNumber
    ? accountNumber.replace(/\d(?=\d{4})/g, "X")
    : "XXXXX.....";

  const summary = useMemo(
    () => ({
      amount: `USD ${parsedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      recipient,
      account: maskedAccountNumber,
      arrival: "Within 1 business day",
      totalDebit: `USD ${totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      currentBalance: `USD ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      remainingBalance: `USD ${remainingBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      transferType: type,
    }),
    [parsedAmount, recipient, maskedAccountNumber, remainingBalance, totalDebit, currentBalance, type],
  );

  useEffect(() => {
    setCurrentBalance(getAvailableBalance());
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);

    await createTransferRequest({
      customerName: "Daniel Morgan",
      customerEmail: "daniel.morgan@atlasbank.com",
      recipient,
      bank,
      accountNumber,
      swift: routing,
      amount: parsedAmount,
      fee,
      description: description || "Funds transfer",
      direction: "outbound",
    });

    router.push("/dashboard/transactions");
  };

  return (
    <div className="transfer-layout">
      <section className="transfer-panel" aria-labelledby="transfer-form-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Initiate funds transfer</p>
            <h3 id="transfer-form-title">Transfer details</h3>
          </div>
        </div>

        <form className="transfer-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="amount">Amount</label>
            <div className="currency-input">
              <span>USD</span>
              <input
                id="amount"
                type="text"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="recipient">Recipient name</label>
            <input
              id="recipient"
              type="text"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
            />
          </div>

          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="bank">Bank</label>
              <select id="bank" value={bank} onChange={(event) => setBank(event.target.value)}>
                <option value="">Select a bank</option>
                {banks.map((bankOption) => (
                  <option key={bankOption} value={bankOption}>
                    {bankOption}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="accountNumber">Account number</label>
              <input
                id="accountNumber"
                type="text"
                value={accountNumber}
                onChange={(event) => setAccountNumber(event.target.value)}
                placeholder="XXXXX....."
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="routing">Routing / SWIFT</label>
            <input
              id="routing"
              type="text"
              value={routing}
              onChange={(event) => setRouting(event.target.value)}
              placeholder="CHASUS33"
            />
          </div>

          <div className="field-group">
            <label>Transfer type</label>
            <div className="radio-group">
              {transferTypes.map((option) => (
                <label key={option} className={`radio-pill ${type === option ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="transferType"
                    value={option}
                    checked={type === option}
                    onChange={() => setType(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Monthly Rent"
            />
          </div>

          <div className="form-actions">
            <button className="secondary-btn" type="button" onClick={() => router.push("/dashboard")}> 
              Cancel
            </button>
            <button className="primary-btn" type="submit" disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? "Processing..." : isFormValid ? "Initiate Transfer" : "Continue"}
            </button>
          </div>
        </form>
      </section>

      <TransferSummary
        amount={summary.amount}
        recipient={summary.recipient}
        account={summary.account}
        arrival={summary.arrival}
        transferType={summary.transferType}
        totalDebit={summary.totalDebit}
        currentBalance={summary.currentBalance}
        remainingBalance={summary.remainingBalance}
      />
    </div>
  );
}
