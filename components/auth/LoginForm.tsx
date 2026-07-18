"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ContactAdminModal from "@/components/auth/ContactAdminModal";
import { formatCurrency, getAvailableBalance } from "@/lib/adminData";

type FormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const initialValues: FormValues = {
  email: "",
  password: "",
  rememberMe: false,
};

function validate(values: FormValues) {
  const errors: Partial<Record<keyof FormValues, string>> = {};

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.password.trim()) {
    errors.password = "Password is required.";
  }

  return errors;
}

export default function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError("");

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length !== 0) {
      return;
    }

    const validEmail = "daniel.morgan@atlasbank.com";
    const validPassword = "Morgan@517!";

    if (values.email === validEmail && values.password === validPassword) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("isLoggedIn", "true");
        window.localStorage.setItem("currentUser", validEmail);
        window.localStorage.setItem("customerName", "Daniel Morgan");
        window.localStorage.setItem("accountNumber", "4589201834");
        window.localStorage.setItem("customerId", "ATB-102938");
        window.localStorage.setItem("accountType", "Atlas Premier Checking");
        window.localStorage.setItem("availableBalance", formatCurrency(getAvailableBalance()));
        window.localStorage.setItem("status", "Verified");
      }

      router.push("/dashboard");
      return;
    }

    setAuthError("Invalid email or password. Please check your credentials and try again.");
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-field-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          placeholder="you@example.com"
        />
        {errors.email ? <p className="field-error">{errors.email}</p> : null}
      </div>

      <div className="auth-field-group">
        <label htmlFor="password">Password</label>
        <div className="auth-field-with-action">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={values.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
          <button
            className="auth-inline-toggle"
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password ? <p className="field-error">{errors.password}</p> : null}
      </div>

      <div className="auth-row">
        <label className="auth-checkbox compact-checkbox">
          <input
            name="rememberMe"
            type="checkbox"
            checked={values.rememberMe}
            onChange={handleChange}
          />
          <span>Remember Me</span>
        </label>

        <Link className="auth-link" href="/forgot-password">
          Forgot Password?
        </Link>
      </div>

      <button className="auth-submit" type="submit">
        Sign In
      </button>

      {authError ? <p className="field-error">{authError}</p> : null}

      <p className="auth-switch">
        Don&apos;t have an account? <button type="button" className="auth-link" onClick={() => setShowContactModal(true)}>Create Account</button>
      </p>

      <ContactAdminModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
    </form>
  );
}
