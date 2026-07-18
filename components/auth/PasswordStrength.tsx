type PasswordStrengthProps = {
  password: string;
};

const getStrength = (value: string) => {
  let score = 0;

  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  if (score <= 2) return { label: "Weak", color: "#ef4444", width: "30%" };
  if (score <= 4) return { label: "Medium", color: "#f59e0b", width: "70%" };
  return { label: "Strong", color: "#10b981", width: "100%" };
};

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = getStrength(password);

  return (
    <div className="password-strength" aria-live="polite">
      <div className="password-strength-top">
        <span>Password strength</span>
        <strong style={{ color: strength.color }}>{strength.label}</strong>
      </div>
      <div className="password-strength-bar" aria-hidden="true">
        <div
          className="password-strength-fill"
          style={{ width: strength.width, backgroundColor: strength.color }}
        />
      </div>
    </div>
  );
}
