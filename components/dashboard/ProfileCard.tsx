export default function ProfileCard() {
  return (
    <section className="profile-card">
      <img className="profile-avatar-large" src="/images/face.jpg" alt="Daniel Morgan" />
      <div className="profile-card-copy">
        <strong>Daniel Morgan</strong>
        <span>ATB-102938</span>
        <div className="profile-badge">
          <span className="badge-icon">✓</span>
          Verified Customer
        </div>
      </div>

      <div className="profile-detail-block">
        <div>
          <span>Full Name</span>
          <strong>Daniel Morgan</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>daniel.morgan@email.com</strong>
        </div>
        <div>
          <span>Phone</span>
          <strong>+1 *** *** 7891</strong>
        </div>
        <div>
          <span>Date of Birth</span>
          <strong>March 12 1995</strong>
        </div>
        <div>
          <span>Address</span>
          <strong>New York, USA</strong>
        </div>
      </div>
    </section>
  );
}
