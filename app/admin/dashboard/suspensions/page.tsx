"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminSuspensionControls from "@/components/admin/AdminSuspensionControls";
import { DEMO_CUSTOMER_EMAIL } from "@/lib/adminData";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { fetchRegisteredNewUsers, resetAccountDetails, type CustomerSuspension } from "@/lib/newUserData";
import { supabase } from "@/lib/supabase";
import { sendAccountDetails } from "@/lib/newUserData";

export default function AdminSuspensionsPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerSuspension[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [accountDetails, setAccountDetails] = useState("");
  const [detailsMessage, setDetailsMessage] = useState("");
  const [isSendingDetails, setIsSendingDetails] = useState(false);
  const [isResettingDetails, setIsResettingDetails] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.replace("/admin/login");
      return;
    }

    const loadCustomers = async () => {
      try {
        const loadedCustomers = await fetchRegisteredNewUsers();
        if (!loadedCustomers.some((customer) => customer.email.toLowerCase() === DEMO_CUSTOMER_EMAIL.toLowerCase())) {
          loadedCustomers.unshift({
            email: DEMO_CUSTOMER_EMAIL,
            fullName: "Daniel Morgan",
            accountNumber: "4589201834",
            suspended: false,
          });
        }
        setCustomers(loadedCustomers);
      } catch {
        setLoadError("We could not load customers. Check your Supabase connection and policies.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();

    const channel = supabase?.channel("admin-customer-review-requests")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "customers" }, (payload) => {
        const updated = payload.new as Record<string, unknown>;
        const email = String(updated.email ?? "").toLowerCase();
        if (!email) return;
        setCustomers((current) => current.map((customer) => customer.email.toLowerCase() === email ? {
          ...customer,
          suspended: updated.suspended === true,
          suspensionReason: updated.suspension_reason ? String(updated.suspension_reason) : undefined,
          reviewRequest: updated.review_request ? String(updated.review_request) : undefined,
          reviewRequestedAt: updated.review_requested_at ? String(updated.review_requested_at) : undefined,
          accountDetails: updated.account_details ? String(updated.account_details) : undefined,
          accountDetailsSentAt: updated.account_details_sent_at ? String(updated.account_details_sent_at) : undefined,
        } : customer));
      })
      .subscribe();

    return () => {
      if (channel) void supabase?.removeChannel(channel);
    };
  }, [router]);

  const selectedCustomer = customers.find((customer) => customer.email === selectedEmail);

  const handleSendDetails = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCustomer) {
      setDetailsMessage("Select a customer first.");
      return;
    }
    setIsSendingDetails(true);
    setDetailsMessage("");
    try {
      const updated = await sendAccountDetails(selectedCustomer.email, accountDetails);
      if (updated) {
        setCustomers((current) => current.map((customer) => customer.email === updated.email ? updated : customer));
        setAccountDetails("");
        setDetailsMessage(`Account details sent to ${updated.fullName}.`);
      }
    } catch {
      setDetailsMessage("We could not send the account details. Check the customer record and try again.");
    } finally {
      setIsSendingDetails(false);
    }
  };

  const handleResetDetails = async () => {
    if (!selectedCustomer || !window.confirm(`Reset the account details sent to ${selectedCustomer.fullName}?`)) return;

    setIsResettingDetails(true);
    setDetailsMessage("");
    try {
      const updated = await resetAccountDetails(selectedCustomer.email);
      if (updated) {
        setCustomers((current) => current.map((customer) => customer.email === updated.email ? updated : customer));
        setAccountDetails("");
        setDetailsMessage(`Account details for ${updated.fullName} are ready to be generated again.`);
      }
    } catch {
      setDetailsMessage("We could not reset the sent account details.");
    } finally {
      setIsResettingDetails(false);
    }
  };

  return (
    <main className="dashboard-page admin-dashboard-page">
      <AdminSidebar />
      <section className="dashboard-main">
        <AdminTopbar title="Customer Suspensions" />
        <section className="admin-funding-section">
          {isLoading ? <p className="settings-note">Loading customers...</p> : null}
          {loadError ? <p className="settings-note" style={{ color: "#b91c1c" }}>{loadError}</p> : null}
          {!isLoading && !loadError ? (
            <>
              <AdminSuspensionControls
                customers={customers}
                onUpdated={(updatedCustomer) => {
                  setCustomers((current) => current.map((customer) => customer.email === updatedCustomer.email ? updatedCustomer : customer));
                  if (!updatedCustomer.reviewRequest) {
                    setSelectedEmail("");
                    setAccountDetails("");
                  }
                }}
              />
              <section className="admin-fund-card account-generation-panel">
                <div className="panel-heading admin-request-heading">
                  <div>
                    <p className="eyebrow">Review queue</p>
                    <h3>Customer requests</h3>
                  </div>
                  <span className="admin-queue-count">{customers.filter((customer) => customer.reviewRequest === "account_generation" || customer.reviewRequest === "money_sent").length} waiting</span>
                </div>
                <div className="admin-review-request-list">
                  {customers.filter((customer) => customer.reviewRequest === "account_generation" || customer.reviewRequest === "money_sent" || customer.accountDetails).map((customer) => (
                    <button className={`admin-review-request ${selectedEmail === customer.email ? "active" : ""}`} type="button" key={customer.email} onClick={() => { setSelectedEmail(customer.email); setAccountDetails(customer.accountDetails ?? ""); }}>
                      <span className="admin-request-avatar">{customer.fullName.charAt(0)}</span>
                      <span className="admin-request-copy"><strong>{customer.fullName}</strong><span>{customer.email}</span></span>
                      <small className={customer.reviewRequest === "money_sent" ? "money-sent" : customer.accountDetails ? "details-sent" : "account-request"}>{customer.reviewRequest === "money_sent" ? "Money sent" : customer.accountDetails ? "Details sent" : "Generate account"}</small>
                    </button>
                  ))}
                  {!customers.some((customer) => customer.reviewRequest === "account_generation" || customer.reviewRequest === "money_sent" || customer.accountDetails) ? <p className="settings-note">No customer requests are waiting.</p> : null}
                </div>
                <form className="transfer-form" onSubmit={handleSendDetails}>
                  <div className="field-group">
                    <label htmlFor="account-generation-customer">Customer</label>
                    <select id="account-generation-customer" value={selectedEmail} onChange={(event) => { setSelectedEmail(event.target.value); const customer = customers.find((item) => item.email === event.target.value); setAccountDetails(customer?.accountDetails ?? ""); }}>
                      <option value="">Select a customer</option>
                      {customers.filter((customer) => customer.reviewRequest === "account_generation" || customer.reviewRequest === "money_sent" || customer.accountDetails).map((customer) => <option key={customer.email} value={customer.email}>{customer.fullName} ({customer.email})</option>)}
                    </select>
                  </div>
                  <div className="field-group">
                    <label htmlFor="generated-account-details">Account details</label>
                    <textarea id="generated-account-details" rows={5} value={accountDetails} onChange={(event) => setAccountDetails(event.target.value)} placeholder="Enter the generated account details" />
                  </div>
                  <div className="form-actions"><button className="primary-btn" type="submit" disabled={isSendingDetails || isResettingDetails || !selectedCustomer || !accountDetails.trim()}>{isSendingDetails ? "Sending..." : "Send details to customer"}</button><button className="secondary-btn" type="button" onClick={handleResetDetails} disabled={isSendingDetails || isResettingDetails || !selectedCustomer || !selectedCustomer.accountDetails}>{isResettingDetails ? "Resetting..." : "Reset sent details"}</button></div>
                  {detailsMessage ? <p className="settings-note" role="status">{detailsMessage}</p> : null}
                </form>
              </section>
            </>
          ) : null}
        </section>
      </section>
    </main>
  );
}
