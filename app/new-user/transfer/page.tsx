"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import TransferSummary from "@/components/dashboard/TransferSummary";
import TransferNoticeModal from "@/components/common/TransferNoticeModal";
import { createNewUserTransfer, fetchCustomerSuspensionByEmail, fetchTransferPinByEmail, getNewUserSession, refreshNewUserSessionBalance, type NewUserAccount } from "@/lib/newUserData";

const banks = ["Atlas Bank", "JPMorgan Chase", "Bank of America", "Wells Fargo", "Citibank", "HSBC", "Barclays", "Santander", "Deutsche Bank", "Standard Chartered"];
const transferTypes = ["Internal Transfer", "Domestic Transfer", "International Wire"];

function sanitizeAmountInput(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    return `${parts[0]}.${parts.slice(1).join("")}`;
  }
  return cleaned;
}

export default function NewUserTransferPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [bank, setBank] = useState("");
  const [customBank, setCustomBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routing, setRouting] = useState("");
  const [type, setType] = useState("Domestic Transfer");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [session, setSession] = useState<NewUserAccount | null>(null);
  const [submissionError, setSubmissionError] = useState("");
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [transferCode, setTransferCode] = useState("");
  const [transferPin, setTransferPin] = useState<string | null>(null);
  const [isLoadingTransferPin, setIsLoadingTransferPin] = useState(true);
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
  const [notice, setNotice] = useState<"success" | "lifted" | null>(null);

  const parsedAmount = Number.parseFloat(amount.replace(/[^\d.]/g, "")) || 0;
  const fee = 0;
  const currentBalance = Number(session?.availableBalance.replace(/[$,]/g, "") ?? 0);
  const totalDebit = parsedAmount;
  const remainingBalance = currentBalance - totalDebit;
  const isAccountNumberValid = /^\d{10,12}$/.test(accountNumber);
  const hasInsufficientBalance = parsedAmount > 0 && currentBalance < parsedAmount;
  const selectedBank = bank === "Other" ? customBank.trim() : bank;
  const isFormValid = Boolean(amount.trim()) && Boolean(recipient.trim()) && Boolean(selectedBank) && isAccountNumberValid && parsedAmount > 0 && currentBalance >= parsedAmount;
  const maskedAccountNumber = accountNumber ? accountNumber.replace(/\d(?=\d{4})/g, "X") : "XXXXX.....";
  const validationMessage = hasInsufficientBalance ? "You do not have enough available balance to send this transfer." : parsedAmount <= 0 ? "Enter an amount greater than $0.00." : "";

  useEffect(() => {
    const loadSession = async () => {
      const currentSession = await refreshNewUserSessionBalance() ?? getNewUserSession();
      setSession(currentSession);
      if (currentSession?.customerEmail) {
        fetchTransferPinByEmail(currentSession.customerEmail)
          .then(setTransferPin)
          .catch(() => setTransferPin(null))
          .finally(() => setIsLoadingTransferPin(false));
      } else {
        setIsLoadingTransferPin(false);
      }
    };

    loadSession();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("suspensionLifted") === "1") {
      setNotice("lifted");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const summary = useMemo(() => ({
    amount: `USD ${parsedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    recipient,
    account: maskedAccountNumber,
    arrival: "Within 1 business day",
    totalDebit: `USD ${totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    currentBalance: `USD ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    remainingBalance: `USD ${remainingBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    transferType: type,
  }), [parsedAmount, recipient, maskedAccountNumber, remainingBalance, totalDebit, currentBalance, type]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid || !session) {
      setSubmissionError(validationMessage || "Please complete the transfer details before submitting.");
      return;
    }

    setSubmissionError("");
    setTransferCode("");
    setIsCodeModalOpen(true);
  };

  const handleConfirmTransfer = async () => {
    const currentSession = session;

    if (!transferPin) {
      setSubmissionError("Your transfer code has not been configured. Please contact the administrator.");
      return;
    }

    if (!currentSession || !/^\d{4}$/.test(transferCode) || transferCode !== transferPin) {
      setSubmissionError("The transfer code is incorrect. Please try again.");
      return;
    }

    setSubmissionError("");
    setIsVerifyingAccount(true);
    await new Promise((resolve) => window.setTimeout(resolve, 3000));

    try {
      const suspension = await fetchCustomerSuspensionByEmail(currentSession.customerEmail);
      if (suspension?.suspended) {
        setIsVerifyingAccount(false);
        setIsCodeModalOpen(false);
        router.push("/suspension");
        return;
      }
    } catch {
      setSubmissionError("We could not verify your account status. Please try again.");
      setIsVerifyingAccount(false);
      return;
    }

    setIsVerifyingAccount(false);
    setIsCodeModalOpen(false);
    setIsSubmitting(true);

    try {
      await createNewUserTransfer({
        customerName: currentSession.customerName,
        customerEmail: currentSession.customerEmail,
        recipient: recipient || "Unknown Recipient",
        bank: selectedBank || "Unknown Bank",
        accountNumber: accountNumber,
        swift: routing,
        amount: parsedAmount,
        fee,
        description,
        direction: "outbound",
      });

      setNotice("success");
      window.setTimeout(() => router.push("/new-user/transactions"), 2000);
    } catch {
      setSubmissionError("We could not submit this transfer. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="dashboard-page">
      <Sidebar basePath="/new-user" />

      <section className="dashboard-main">
        <TopNavbar userName={session?.customerName ?? "New Customer"} balance={session?.availableBalance ?? "$0.00"} variant="new-user" />

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
                  <input id="amount" type="text" inputMode="decimal" value={amount} onChange={(event) => setAmount(sanitizeAmountInput(event.target.value))} />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="recipient">Recipient name</label>
                <input id="recipient" type="text" value={recipient} onChange={(event) => setRecipient(event.target.value)} />
              </div>

              <div className="field-grid">
                <div className="field-group">
                  <label htmlFor="bank">Bank</label>
                  <select id="bank" value={bank} onChange={(event) => setBank(event.target.value)}>
                    <option value="">Select a bank</option>
                    {banks.map((bankOption) => (<option key={bankOption} value={bankOption}>{bankOption}</option>))}
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
                  <input id="accountNumber" type="text" inputMode="numeric" value={accountNumber} onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, ""))} maxLength={12} />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="routing">Routing / SWIFT</label>
                <input id="routing" type="text" value={routing} onChange={(event) => setRouting(event.target.value)} placeholder="CHASUS33" />
              </div>

              <div className="field-group">
                <label>Transfer type</label>
                <div className="radio-group">
                  {transferTypes.map((option) => (
                    <label key={option} className={`radio-pill ${type === option ? "active" : ""}`}>
                      <input type="radio" name="transferType" value={option} checked={type === option} onChange={() => setType(option)} />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Monthly Rent" />
              </div>

              {submissionError ? <p className="settings-note" style={{ color: "#b91c1c", marginBottom: "0.75rem" }}>{submissionError}</p> : null}
              {validationMessage && !submissionError ? <p className="settings-note" style={{ color: "#b91c1c", marginBottom: "0.75rem" }}>{validationMessage}</p> : null}

              <div className="form-actions">
                <button className="secondary-btn" type="button" onClick={() => router.push("/new-user/dashboard")}>Cancel</button>
                <button className="primary-btn" type="submit" disabled={!isFormValid || isSubmitting || isLoadingTransferPin}>
                  {isSubmitting ? "Processing..." : isLoadingTransferPin ? "Loading..." : hasInsufficientBalance ? "Insufficient funds" : isFormValid ? "Initiate Transfer" : "Continue"}
                </button>
              </div>
            </form>
          </section>

          {isCodeModalOpen ? (
            <div className="transfer-code-overlay" role="presentation" onMouseDown={() => setIsCodeModalOpen(false)}>
              <section className="transfer-code-modal" role="dialog" aria-modal="true" aria-labelledby="new-user-transfer-code-title" onMouseDown={(event) => event.stopPropagation()}>
                <div className="transfer-code-modal-header">
                  <div>
                    <p className="eyebrow">Final security check</p>
                    <h2 id="new-user-transfer-code-title">Enter transfer code</h2>
                  </div>
                  <button className="modal-close-btn" type="button" aria-label="Close transfer code dialog" onClick={() => setIsCodeModalOpen(false)}>×</button>
                </div>
                <p className="transfer-code-copy">Enter the 4-digit code configured for your account to authorize this transfer.</p>
                <div className="field-group">
                  <label htmlFor="newUserTransferCode">Transfer code</label>
                  <input
                    id="newUserTransferCode"
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
                    <button className="primary-btn" type="button" onClick={handleConfirmTransfer} disabled={transferCode.length !== 4 || isSubmitting || isVerifyingAccount}>{isVerifyingAccount ? "Verifying account..." : "Authorize transfer"}</button>
                  </div>
                </div>
              </section>
            </div>
          ) : null}

          {isVerifyingAccount ? <div className="transfer-verification-status" role="status"><span className="transfer-spinner" />Verifying your account...</div> : null}
          {notice === "success" ? <TransferNoticeModal title="Transfer submitted" message="Your transfer has been sent successfully." /> : null}
          {notice === "lifted" ? <TransferNoticeModal title="Suspension lifted" message="Your account is active again. You can continue with your transfer." actionLabel="OK" onAction={() => setNotice(null)} /> : null}

          <TransferSummary amount={summary.amount} recipient={summary.recipient} account={summary.account} arrival={summary.arrival} transferType={summary.transferType} totalDebit={summary.totalDebit} currentBalance={summary.currentBalance} remainingBalance={summary.remainingBalance} />
        </div>
      </section>
    </main>
  );
}
