"use client";

type TransferNoticeModalProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function TransferNoticeModal({ title, message, actionLabel, onAction }: TransferNoticeModalProps) {
  return (
    <div className="transfer-notice-overlay" role="alertdialog" aria-modal="true" aria-labelledby="transfer-notice-title">
      <section className="transfer-notice-modal">
        <div className="transfer-notice-mark" aria-hidden="true">✓</div>
        <h2 id="transfer-notice-title">{title}</h2>
        <p>{message}</p>
        {actionLabel && onAction ? <button className="primary-btn" type="button" onClick={onAction}>{actionLabel}</button> : null}
      </section>
    </div>
  );
}
