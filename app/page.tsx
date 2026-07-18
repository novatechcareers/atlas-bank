import Link from "next/link";
import FeatureCard from "@/components/landing/FeatureCard";
import Hero from "@/components/landing/Hero";
import Navbar from "@/components/landing/Navbar";
import Statistics from "@/components/landing/Statistics";

const features = [
  {
    icon: "🛡️",
    title: "Bank-Level Security",
    description:
      "Your funds and personal information are protected using modern encryption and security practices.",
  },
  {
    icon: "🌍",
    title: "Global Transfers",
    description:
      "Send money to friends, family, and businesses worldwide in just a few clicks.",
  },
  {
    icon: "⚡",
    title: "Instant Banking",
    description:
      "Manage your finances anytime with real-time account updates and lightning-fast transactions.",
  },
];

const testimonials = [
  {
    quote:
      "Atlas Bank makes global wealth feel effortless. Every detail feels considered.",
    name: "Maya Chen",
    role: "Founder, Northstar Capital",
  },
  {
    quote:
      "The experience is seamless, secure, and beautifully designed from start to finish.",
    name: "Daniel Ortiz",
    role: "Private Client",
  },
];

export default function Home() {
  return (
    <main className="home-page">
      <Navbar />

      <Hero />

      <section className="band" aria-label="Atlas Bank customer trust">
        <p>Trusted by leading founders, executives, and global families.</p>
        <div className="band-logos" aria-hidden="true">
          <span>Northstar</span>
          <span>Helio</span>
          <span>Vanta</span>
          <span>Orbital</span>
        </div>
      </section>

      <section className="section" id="features">
        <div className="section-heading feature-section-heading">
          <p className="eyebrow">Why Choose Atlas Bank?</p>
          <h2>Bank with confidence using secure, fast, and modern financial services built for everyone.</h2>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </section>

      <Statistics />

      <section className="section testimonials-section">
        <div className="section-heading">
          <p className="eyebrow">Client stories</p>
          <h2>Premium service that feels personal at every step.</h2>
        </div>

        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <article className="testimonial-card" key={item.name}>
              <p>“{item.quote}”</p>
              <div>
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-banner">
        <div>
          <p className="eyebrow">Start your journey</p>
          <h2>Open an account and experience the future of private banking.</h2>
        </div>
        <Link className="cta cta-primary" href="/auth/open-account">
          Open Account
        </Link>
      </section>

      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand-block">
            <div className="footer-brand">
              <span className="footer-brand-mark" aria-hidden="true">
                A
              </span>
              <span>Atlas Bank</span>
            </div>
            <p>
              Modern banking for global citizens, entrepreneurs, and families who
              expect security, clarity, and speed in every transaction.
            </p>
          </div>

          <div className="footer-column">
            <h3>Company</h3>
            <Link href="/about">About Atlas Bank</Link>
            <Link href="/careers">Careers</Link>
            <Link href="/newsroom">Newsroom</Link>
            <Link href="/investors">Investor Relations</Link>
          </div>

          <div className="footer-column">
            <h3>Banking</h3>
            <Link href="/personal">Personal Banking</Link>
            <Link href="/business">Business Banking</Link>
            <Link href="/savings">Savings</Link>
            <Link href="/loans">Loans</Link>
          </div>

          <div className="footer-column">
            <h3>Support</h3>
            <Link href="/help">Help Center</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/security">Security Center</Link>
            <Link href="/faq">FAQs</Link>
          </div>

          <div className="footer-column">
            <h3>Legal</h3>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms & Conditions</Link>
            <Link href="/cookies">Cookie Policy</Link>
          </div>

          <div className="footer-column">
            <h3>Contact</h3>
            <a href="mailto:workdaysupport.novatech@gmail.com">workdaysupport.novatech@gmail.com</a>
            <a href="tel:+18005550199">+1 (800) 555-0199</a>
            <span>14 Harbor Avenue, Dublin 2, Ireland</span>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Atlas Bank. All Rights Reserved.</p>
          <p>Licensed by the Global Financial Services Authority.</p>
        </div>
      </footer>
    </main>
  );
}
