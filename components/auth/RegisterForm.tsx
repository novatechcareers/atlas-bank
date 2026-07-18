"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type FormValues = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
};

const initialValues: FormValues = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  agreedToTerms: false,
};

function validate(values: FormValues) {
  const errors: Partial<Record<keyof FormValues, string>> = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!/^\+?[0-9\s-]{7,15}$/.test(values.phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (!/[A-Z]/.test(values.password)) {
    errors.password = "Password must include an uppercase letter.";
  } else if (!/[a-z]/.test(values.password)) {
    errors.password = "Password must include a lowercase letter.";
  } else if (!/\d/.test(values.password)) {
    errors.password = "Password must include a number.";
  } else if (!/[^A-Za-z0-9]/.test(values.password)) {
    errors.password = "Password must include a special character.";
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!values.agreedToTerms) {
    errors.agreedToTerms = "You must agree to the terms and privacy policy.";
  }

  return errors;
}

export default function RegisterForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const passwordStrength = useMemo(() => values.password, [values.password]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    if (!isSupabaseConfigured || !supabase) {
      setSubmitMessage("Add your Supabase URL and anon key to .env.local to save this user.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("customers").insert([
      {
        full_name: values.fullName.trim(),
        email: values.email.toLowerCase().trim(),
        phone: values.phone.trim(),
        created_at: new Date().toISOString(),
        status: "pending",
      },
    ]);

    if (error) {
      setSubmitMessage(`Unable to save to Supabase: ${error.message}`);
      setIsSubmitting(false);
      return;
    }

    setSubmitMessage("Account details saved to Supabase successfully.");
    setIsSubmitting(false);
    setValues(initialValues);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-field-group">
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          value={values.fullName}
          onChange={handleChange}
          placeholder="Jordan Alvarez"
        />
        {errors.fullName ? <p className="field-error">{errors.fullName}</p> : null}
      </div>

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
        <label htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={values.phone}
          onChange={handleChange}
          placeholder="+1 555 000 1234"
        />
        {errors.phone ? <p className="field-error">{errors.phone}</p> : null}
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
            placeholder="Create a secure password"
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
        <PasswordStrength password={passwordStrength} />
      </div>

      <div className="auth-field-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className="auth-field-with-action">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={values.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
          />
          <button
            className="auth-inline-toggle"
            type="button"
            onClick={() => setShowConfirmPassword((current) => !current)}
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.confirmPassword ? <p className="field-error">{errors.confirmPassword}</p> : null}
      </div>

      <label className="auth-checkbox">
        <input
          name="agreedToTerms"
          type="checkbox"
          checked={values.agreedToTerms}
          onChange={handleChange}
        />
        <span>I agree to the Terms and Privacy Policy</span>
      </label>
      {errors.agreedToTerms ? <p className="field-error">{errors.agreedToTerms}</p> : null}

      {submitMessage ? <p className="field-error">{submitMessage}</p> : null}

      <button className="auth-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Create Account"}
      </button>

      <p className="auth-switch">
        Already have an account? <Link href="/auth/login">Sign In</Link>
      </p>
    </form>
  );
}
