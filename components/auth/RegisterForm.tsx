"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { getDefaultNewUserSession, saveNewUserCustomerToSupabase, saveNewUserSession } from "@/lib/newUserData";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type FormValues = {
  fullName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
};

const countryOptions = [
  { label: "United States", code: "1" },
  { label: "United Kingdom", code: "44" },
  { label: "Canada", code: "1" },
  { label: "Australia", code: "61" },
  { label: "Germany", code: "49" },
  { label: "France", code: "33" },
  { label: "Nigeria", code: "234" },
  { label: "India", code: "91" },
  { label: "South Africa", code: "27" },
];

const initialValues: FormValues = {
  fullName: "",
  email: "",
  countryCode: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  agreedToTerms: false,
};

function validate(values: FormValues) {
  const errors: Partial<Record<keyof FormValues, string>> = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (!/^[A-Za-z\s.'-]+$/.test(values.fullName.trim())) {
    errors.fullName = "Full name can only contain letters and basic punctuation.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!/^\d{1,4}$/.test(values.countryCode)) {
    errors.countryCode = "Enter a valid country code.";
  }

  if (!/^\d{7,15}$/.test(values.phoneNumber)) {
    errors.phoneNumber = "Enter a valid phone number.";
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
  const router = useRouter();
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

    if (name === "fullName") {
      const sanitized = value.replace(/[^A-Za-z\s.'-]/g, "");
      setValues((current) => ({
        ...current,
        fullName: sanitized,
      }));
      return;
    }

    if (name === "phoneNumber") {
      const sanitized = value.replace(/\D/g, "");
      setValues((current) => ({
        ...current,
        phoneNumber: sanitized,
      }));
      return;
    }

    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCountryCodeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setValues((current) => ({
      ...current,
      countryCode: event.target.value.replace(/\D/g, ""),
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

    const normalizedEmail = values.email.toLowerCase().trim();
    const normalizedName = values.fullName.trim();
    const normalizedPhone = `+${values.countryCode.trim()} ${values.phoneNumber.trim()}`.trim();
    const newUserSession = {
      ...getDefaultNewUserSession(),
      customerName: normalizedName,
      customerEmail: normalizedEmail,
      phone: normalizedPhone,
      profileCompleted: false,
      accountType: "Atlas New Customer",
      availableBalance: "$0.00",
      status: "Active",
      customerSince: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await saveNewUserCustomerToSupabase({
          fullName: normalizedName,
          email: normalizedEmail,
          phone: normalizedPhone,
          password: values.password,
          accountNumber: newUserSession.accountNumber,
          status: "pending",
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown Supabase error";
        setSubmitMessage(`Unable to save to Supabase: ${errorMessage}`);
        setIsSubmitting(false);
        return;
      }
    }

    const registeredUsersRaw = typeof window !== "undefined" ? window.localStorage.getItem("atlasRegisteredUsers") : null;
    const existingRegisteredUsers = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : [];
    const nextRegisteredUsers = Array.isArray(existingRegisteredUsers)
      ? existingRegisteredUsers.filter((user: Record<string, string>) => user.email !== normalizedEmail)
      : [];

    nextRegisteredUsers.push({
      fullName: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      password: values.password,
      createdAt: new Date().toISOString(),
    });

    if (typeof window !== "undefined") {
      window.localStorage.setItem("atlasRegisteredUsers", JSON.stringify(nextRegisteredUsers));
      window.localStorage.setItem("isLoggedIn", "true");
      window.localStorage.setItem("currentUser", normalizedEmail);
    }

    saveNewUserSession(newUserSession);

    setSubmitMessage("Account created successfully. Redirecting you to your new account...");
    setIsSubmitting(false);
    setValues(initialValues);
    router.push("/new-user/dashboard");
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
        />
        {errors.email ? <p className="field-error">{errors.email}</p> : null}
      </div>

      <div className="auth-field-group">
        <label htmlFor="countryCode">Phone Number</label>
        <div className="auth-field-with-action" style={{ gap: "0.75rem" }}>
          <select
            id="countryCode"
            name="countryCode"
            value={values.countryCode ?? ""}
            onChange={handleCountryCodeChange}
            style={{ maxWidth: "220px" }}
          >
            <option value="">Select country</option>
            {countryOptions.map((country) => (
              <option key={country.code + country.label} value={country.code}>
                {country.label} (+{country.code})
              </option>
            ))}
          </select>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="text"
            inputMode="numeric"
            value={values.phoneNumber ?? ""}
            onChange={handleChange}
          />
        </div>
        {errors.countryCode ? <p className="field-error">{errors.countryCode}</p> : null}
        {errors.phoneNumber ? <p className="field-error">{errors.phoneNumber}</p> : null}
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
