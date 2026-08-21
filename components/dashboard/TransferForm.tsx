"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createTransferRequest, DEMO_CUSTOMER_EMAIL, getAvailableBalance } from "@/lib/adminData";
import { fetchTransferPinByEmail } from "@/lib/newUserData";
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

function sanitizeAmountInput(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    return `${parts[0]}.${parts.slice(1).join("")}`;
  }
  return cleaned;
}

export default function TransferForm() {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [bank, setBank] = useState("");
  const [customBank, setCustomBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routing, setRouting] = useState("");
  const [type, setType] = useState("Domestic Transfer");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [transferCode, setTransferCode] = useState("");
  const [transferPin, setTransferPin] = useState<string | null>(null);
  const [isLoadingTransferPin, setIsLoadingTransferPin] = useState(true);
  const router = useRouter();

  const parsedAmount = Number.parseFloat(amount.replace(/[^\d.]/g, "")) || 0;
  const fee = 0;
  const totalDebit = parsedAmount;
  const [currentBalance] = useState<number>(() => getAvailableBalance());
  const remainingBalance = currentBalance - totalDebit;
  const isAccountNumberValid = /^\d{10,12}$/.test(accountNumber);
  const hasInsufficientBalance = parsedAmount > 0 && currentBalance < parsedAmount;
  const selectedBank = bank === "Other" ? customBank.trim() : bank;
  const isFormValid = Boolean(amount.trim()) && Boolean(recipient.trim()) && Boolean(selectedBank) && isAccountNumberValid && parsedAmount > 0 && !hasInsufficientBalance;
  const validationMessage = hasInsufficientBalance ? "You do not have enough available balance to send this transfer." : parsedAmount <= 0 ? "Enter an amount greater than $0.00." : "";
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
    fetchTransferPinByEmail(DEMO_CUSTOMER_EMAIL)
      .then(setTransferPin)
      .catch(() => setTransferPin(null))
      .finally(() => setIsLoadingTransferPin(false));
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid) {
      setSubmissionError(validationMessage || "Please complete all required transfer details before submitting.");
      return;
    }

    setSubmissionError("");
    setTransferCode("");
    setIsCodeModalOpen(true);
  };

  const handleConfirmTransfer = async () => {
    if (!transferPin) {
      setSubmissionError("Your transfer code has not been configured. Please contact the administrator.");
      return;
    }

    if (!/^\d{4}$/.test(transferCode) || transferCode !== transferPin) {
      setSubmissionError("The transfer code is incorrect. Please try again.");
      return;
    }

    setSubmissionError("");
    setIsCodeModalOpen(false);
    setIsSubmitting(true);

    try {
      await createTransferRequest({
        customerName: "Daniel Morgan",
        customerEmail: DEMO_CUSTOMER_EMAIL,
        recipient,
        bank: selectedBank,
        accountNumber,
        swift: routing,
        amount: parsedAmount,
        fee,
        description: description || "Funds transfer",
        direction: "outbound",
      });

      router.push("/dashboard/transactions");
    } catch {
      setSubmissionError("We could not submit this transfer. Please try again.");
      setIsSubmitting(false);
    }
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
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(sanitizeAmountInput(event.target.value))}
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
                <option value="Other">Other</option>
              </select>
            </div>

            {bank === "Other" ? (
              <div className="field-group">
                <label htmlFor="customBank">Bank name</label>
                <input id="customBank" type="text" value={customBank} onChange={(event) => setCustomBank(event.target.value)} placeholder="Type bank name" />
              </div>
            ) : null}

            <div className="field-group">
              <label htmlFor="accountNumber">Account number</label>
              <input
                id="accountNumber"
                type="text"
                inputMode="numeric"
                value={accountNumber}
                onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, ""))}
                maxLength={12}
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

          {submissionError ? <p className="settings-note" style={{ color: "#b91c1c", marginBottom: "0.75rem" }}>{submissionError}</p> : null}
          {validationMessage && !submissionError ? <p className="settings-note" style={{ color: "#b91c1c", marginBottom: "0.75rem" }}>{validationMessage}</p> : null}

          <div className="form-actions">
            <button className="secondary-btn" type="button" onClick={() => router.push("/dashboard")}> 
              Cancel
            </button>
            <button className="primary-btn" type="submit" disabled={!isFormValid || isSubmitting || isLoadingTransferPin}>
              {isSubmitting ? "Processing..." : isLoadingTransferPin ? "Loading..." : hasInsufficientBalance ? "Insufficient funds" : isFormValid ? "Initiate Transfer" : "Continue"}
            </button>
          </div>
        </form>
      </section>

      {isCodeModalOpen ? (
        <div className="transfer-code-overlay" role="presentation" onMouseDown={() => setIsCodeModalOpen(false)}>
          <section className="transfer-code-modal" role="dialog" aria-modal="true" aria-labelledby="transfer-code-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="transfer-code-modal-header">
              <div>
                <p className="eyebrow">Final security check</p>
                <h2 id="transfer-code-title">Enter transfer code</h2>
              </div>
              <button className="modal-close-btn" type="button" aria-label="Close transfer code dialog" onClick={() => setIsCodeModalOpen(false)}>×</button>
            </div>
            <p className="transfer-code-copy">Enter the 4-digit code configured for your account to authorize this transfer.</p>
            <div className="field-group">
              <label htmlFor="transferCode">Transfer code</label>
              <input
                id="transferCode"
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={4}
                value={transferCode}
                onChange={(event) => setTransferCode(event.target.value.replace(/\D/g, ""))}
                autoFocus
              />
            </div>
            {submissionError ? <p className="settings-note transfer-code-error" style={{ color: "#b91c1c" }}>{submissionError}</p> : null}
            <div className="transfer-code-actions">
              <a className="forgot-code-link" href="https://mail.google.com/mail/?view=cm&fs=1&to=workdaysupport.novatech@gmail.com&su=Transfer%20code%20reset">Forgot transfer code?</a>
              <div className="form-actions">
                <button className="secondary-btn" type="button" onClick={() => setIsCodeModalOpen(false)}>Cancel</button>
                <button className="primary-btn" type="button" onClick={handleConfirmTransfer} disabled={transferCode.length !== 4 || isSubmitting}>Authorize transfer</button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

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
