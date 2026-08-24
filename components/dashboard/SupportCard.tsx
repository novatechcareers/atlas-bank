const CUSTOMER_CARE_EMAIL = "workdaysupport.novatech@gmail.com";

export default function SupportCard() {
  return (
    <section className="support-card">
      <p className="eyebrow">Customer Support</p>
      <a href={`mailto:${CUSTOMER_CARE_EMAIL}`}><strong>{CUSTOMER_CARE_EMAIL}</strong></a>
      <span>+1 (800) 555-2048</span>
      <p>24/7 Live Support</p>
    </section>
  );
}
