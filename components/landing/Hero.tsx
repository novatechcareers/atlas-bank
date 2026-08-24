import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">Trusted by over 2 Million Customers</p>
        <h1 id="hero-title">Banking built for your future.</h1>
        <p className="subtitle">
          Atlas Bank helps you protect every dollar, move money securely, grow
          savings faster, and complete transfers with speed that keeps up with
          life.
        </p>

        <div className="hero-actions">
          <Link className="cta cta-primary" href="/auth/open-account" aria-label="Open an Atlas Bank account">
            Open Account
          </Link>
          <Link className="cta cta-secondary" href="/auth/login" aria-label="Sign in to Atlas Bank">
            Sign In
          </Link>
        </div>
      </div>

      <div className="hero-visual" aria-label="Premium Atlas Bank card preview">
        <div className="visual-card">
          <div className="hero-card-shell">
            <div className="hero-card-top">
              <div className="hero-card-brand">
                <span className="hero-brand-mark" aria-hidden="true">
                  A
                </span>
                <span>Atlas Bank</span>
              </div>
              <div className="hero-card-chip" aria-hidden="true" />
            </div>

            <div className="hero-card-balance">
              <span>Available Balance</span>
              <strong>$248,400.00</strong>
            </div>

            <div className="hero-card-details">
              <p className="hero-card-number">4587 2840 1298 5621</p>
              <div className="hero-card-meta">
                <div>
                  <span className="hero-card-label">Valid Thru</span>
                  <div className="hero-card-value">09/29</div>
                </div>
                <div>
                  <span className="hero-card-label">Card Holder</span>
                  <div className="hero-card-value">M. Chen</div>
                </div>
              </div>
            </div>

            <div className="hero-card-footer">
              <span className="hero-card-network" aria-hidden="true">
                VISA
              </span>
              <span className="hero-card-status">Premium Account</span>
            </div>
          </div>

          <div className="hero-floating-stack" aria-hidden="true">
            <div className="hero-floating-card">+$1,250 Received</div>
            <div className="hero-floating-card is-success">Transfer Successful</div>
            <div className="hero-floating-card is-growth">Savings +8%</div>
          </div>
        </div>
      </div>
    </section>
  );
}
