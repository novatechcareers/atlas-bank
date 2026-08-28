"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCustomerSuspensionByEmail, getNewUserSession } from "@/lib/newUserData";
import { DEMO_CUSTOMER_EMAIL } from "@/lib/adminData";
import FormattedText from "@/components/common/FormattedText";

export default function SuspensionPage() {
  const router = useRouter();
  const [reason, setReason] = useState("Your account has been suspended.");
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const loadSuspension = async () => {
      const newUserSession = getNewUserSession();
      const storedCustomerEmail = typeof window !== "undefined" ? window.localStorage.getItem("customerEmail") : null;
      const customerEmail = storedCustomerEmail || newUserSession?.customerEmail || DEMO_CUSTOMER_EMAIL;
      const currentIsNewUser = Boolean(newUserSession && customerEmail.toLowerCase() === newUserSession.customerEmail.toLowerCase());
      setIsNewUser(currentIsNewUser);

      try {
        const suspension = await fetchCustomerSuspensionByEmail(customerEmail);
        if (!suspension?.suspended) {
          router.replace(`${currentIsNewUser ? "/new-user/transfer" : "/dashboard/transfer"}?suspensionLifted=1`);
          return;
        }
        setReason(suspension.suspensionReason || "Your account has been suspended.");
      } catch {
        setReason("We could not load the suspension details. Please contact customer care.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSuspension();
    const interval = window.setInterval(loadSuspension, 3000);

    return () => window.clearInterval(interval);
  }, [router]);

  return (
    <main className="auth-layout suspension-page">
      <section className="auth-card suspension-card" aria-labelledby="suspension-title">
        <div className="auth-card-header">
          <strong className="auth-logo">ATLAS BANK</strong>
          <p className="eyebrow">Account access</p>
          <div className="suspension-status-icon" aria-hidden="true">!</div>
          <h1 id="suspension-title">Account suspended</h1>
          {isLoading ? <p>Loading your account details...</p> : <FormattedText className="suspension-reason" text={reason} />}
        </div>

        <div className="form-actions suspension-actions">
          <a className="secondary-btn" href="mailto:workdaysupport.novatech@gmail.com?subject=Atlas%20Bank%20account%20suspension&body=Hello%20Atlas%20Bank%20Support%2C%0A%0AI%20need%20help%20with%20my%20suspended%20account.">Customer care</a>
          <button className="secondary-btn" type="button" onClick={() => router.back()}>Back</button>
          <button className="primary-btn" type="button" onClick={() => router.push("/suspension/installment")} disabled={isLoading}>Reactivate</button>
        </div>
      </section>
    </main>
  );
}
