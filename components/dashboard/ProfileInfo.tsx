type ProfileInfoProps = {
  accountNumber?: string;
  iban?: string;
  swift?: string;
  customerSince?: string;
  accountType?: string;
  branch?: string;
  onEditProfile?: () => void;
};

export default function ProfileInfo({
  accountNumber = "4589201834",
  iban = "GB89ABCD1234567890",
  swift = "ATLSUS33",
  customerSince = "March 2019",
  accountType = "Premier Checking",
  branch = "Atlas Manhattan",
  onEditProfile,
}: ProfileInfoProps) {
  return (
    <section className="profile-info-panel">
      <div className="profile-info-group">
        <div>
          <p className="eyebrow">Banking information</p>
          <h2>Bank details</h2>
        </div>
        <div className="info-grid">
          <div>
            <span>Account Number</span>
            <strong>{accountNumber}</strong>
          </div>
          <div>
            <span>IBAN</span>
            <strong>{iban}</strong>
          </div>
          <div>
            <span>SWIFT</span>
            <strong>{swift}</strong>
          </div>
          <div>
            <span>Customer Since</span>
            <strong>{customerSince}</strong>
          </div>
          <div>
            <span>Account Type</span>
            <strong>{accountType}</strong>
          </div>
          <div>
            <span>Branch</span>
            <strong>{branch}</strong>
          </div>
        </div>
      </div>

      <div className="profile-info-group">
        <div>
          <p className="eyebrow">Security information</p>
          <h2>Account security</h2>
        </div>
        <div className="info-grid">
          <div>
            <span>Password</span>
            <strong>********</strong>
          </div>
          <div>
            <span>Two-Factor Authentication</span>
            <strong>Enabled</strong>
          </div>
          <div>
            <span>Last Login</span>
            <strong>Today</strong>
          </div>
        </div>
      </div>

      <button className="secondary-btn" type="button" onClick={onEditProfile}>
        Edit Profile
      </button>
    </section>
  );
}
