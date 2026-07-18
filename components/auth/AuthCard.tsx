type AuthCardProps = {
  title?: string;
  description?: string;
  children?: React.ReactNode;
};

export default function AuthCard({
  title = "Create your Atlas Account",
  description = "Join Atlas Bank to manage money securely, transfer globally, and grow your savings with confidence.",
  children,
}: AuthCardProps) {
  return (
    <div className="auth-card" role="region" aria-label="Create account">
      <div className="auth-card-header">
        <p className="eyebrow">Secure Access</p>
        <h1>{title}</h1>
        <p className="auth-card-copy">{description}</p>
      </div>

      {children}
    </div>
  );
}
