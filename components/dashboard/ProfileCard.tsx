"use client";

import { useEffect, useRef, useState } from "react";
import { getNewUserSession, saveNewUserSession } from "@/lib/newUserData";

type ProfileCardProps = {
  name?: string;
  email?: string;
  phone?: string;
  customerId?: string;
  dob?: string;
  address?: string;
  avatarUrl?: string;
  editing?: boolean;
  onEditToggle?: () => void;
  onProfileUpdate?: (nextProfile: {
    name: string;
    email: string;
    phone: string;
    customerId: string;
    dob: string;
    address: string;
    avatarUrl?: string;
  }) => void;
};

type ProfileFormState = {
  name: string;
  email: string;
  phone: string;
  customerId: string;
  dob: string;
  address: string;
  avatarUrl?: string;
};

export default function ProfileCard({
  name = "Daniel Morgan",
  email = "daniel.morgan@email.com",
  phone = "+1 *** *** 7891",
  customerId = "ATB-102938",
  dob = "March 12 1995",
  address = "New York, USA",
  avatarUrl,
  editing = false,
  onEditToggle,
  onProfileUpdate,
}: ProfileCardProps) {
  const [form, setForm] = useState<ProfileFormState>({
    name,
    email,
    phone,
    customerId,
    dob,
    address,
    avatarUrl,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(avatarUrl);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setForm({ name, email, phone, customerId, dob, address, avatarUrl });
    setAvatarPreview(avatarUrl);
  }, [name, email, phone, customerId, dob, address, avatarUrl]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : undefined;
      setAvatarPreview(result);
      setForm((current) => ({ ...current, avatarUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const persistProfile = (nextProfile: ProfileFormState) => {
    const nextAvatarUrl = nextProfile.avatarUrl;
    if (typeof window !== "undefined") {
      const newUserSession = getNewUserSession();
      if (newUserSession) {
        saveNewUserSession({
          ...newUserSession,
          customerName: nextProfile.name,
          customerEmail: nextProfile.email,
          phone: nextProfile.phone,
          dob: nextProfile.dob,
          address: nextProfile.address,
          avatarUrl: nextAvatarUrl,
        });
      } else {
        window.localStorage.setItem("customerName", nextProfile.name);
        window.localStorage.setItem("currentUser", nextProfile.email);
        window.localStorage.setItem("customerEmail", nextProfile.email);
        window.localStorage.setItem("phone", nextProfile.phone);
        window.localStorage.setItem("dob", nextProfile.dob);
        window.localStorage.setItem("address", nextProfile.address);
        if (nextAvatarUrl) {
          window.localStorage.setItem("profileAvatar", nextAvatarUrl);
        }
      }
    }

    onProfileUpdate?.({
      name: nextProfile.name,
      email: nextProfile.email,
      phone: nextProfile.phone,
      customerId: nextProfile.customerId,
      dob: nextProfile.dob,
      address: nextProfile.address,
      avatarUrl: nextAvatarUrl,
    });
  };

  const handleSave = () => {
    persistProfile(form);
    onEditToggle?.();
  };

  return (
    <section className="profile-card">
      <div className="profile-avatar-upload" role="button" tabIndex={0} onClick={() => fileInputRef.current?.click()} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); fileInputRef.current?.click(); } }}>
        {avatarPreview ? (
          <img className="profile-avatar-large" src={avatarPreview} alt={form.name} />
        ) : (
          <div className="profile-avatar-large" aria-label="Upload profile photo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: "54px", height: "54px" }}>
              <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              <path d="M6 19a6 6 0 1 1 12 0" />
            </svg>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileSelect} />
        <span className="avatar-upload-hint">Tap to upload</span>
      </div>

      <div className="profile-card-copy">
        <strong>{form.name}</strong>
        <span>{form.customerId || customerId}</span>
        <div className="profile-badge">
          <span className="badge-icon">✓</span>
          Verified Customer
        </div>
      </div>

      {editing ? (
        <div className="profile-detail-block">
          <div>
            <span>Full Name</span>
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          </div>
          <div>
            <span>Email</span>
            <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          </div>
          <div>
            <span>Phone</span>
            <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
          </div>
          <div>
            <span>Date of Birth</span>
            <input value={form.dob} onChange={(event) => setForm((current) => ({ ...current, dob: event.target.value }))} />
          </div>
          <div>
            <span>Address</span>
            <input value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} />
          </div>
          <div className="profile-actions">
            <button className="primary-btn" type="button" onClick={handleSave}>Save changes</button>
            <button className="secondary-btn" type="button" onClick={onEditToggle}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="profile-detail-block">
          <div>
            <span>Full Name</span>
            <strong>{form.name || "Not provided"}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{form.email || "Not provided"}</strong>
          </div>
          <div>
            <span>Phone</span>
            <strong>{form.phone || "Not provided"}</strong>
          </div>
          <div>
            <span>Date of Birth</span>
            <strong>{form.dob || "Not provided"}</strong>
          </div>
          <div>
            <span>Address</span>
            <strong>{form.address || "Not provided"}</strong>
          </div>
          <div className="profile-actions">
            <button className="secondary-btn" type="button" onClick={onEditToggle}>Edit profile</button>
          </div>
        </div>
      )}
    </section>
  );
}
