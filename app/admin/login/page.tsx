"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateAdminCredentials, setAdminAuthenticated } from "@/lib/adminAuth";

export default function AdminLoginPage() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validateAdminCredentials(adminId.trim(), password)) {
      setAdminAuthenticated(remember);
      router.push("/admin/dashboard");
      return;
    }

    setError("Invalid administrator credentials.");
  };

  return (
    <main className="auth-layout admin-login-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <strong className="auth-logo">ATLAS BANK</strong>
          <h1>Administrator Portal</h1>
          <p>Authorized Personnel Only</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="adminId">Admin ID</label>
            <input
              id="adminId"
              type="text"
              value={adminId}
              onChange={(event) => setAdminId(event.target.value)}
              placeholder="admin"
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Atlas@2026"
            />
          </div>

          <label className="checkbox-label">
            <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
            Remember this device
          </label>

          {error && <p className="field-error">{error}</p>}

          <button className="primary-btn" type="submit">
            Sign In
          </button>
        </form>
      </div>
    </main>
  );
}
