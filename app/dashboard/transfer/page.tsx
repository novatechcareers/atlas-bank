import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import TransferForm from "@/components/dashboard/TransferForm";
import BeneficiaryCard from "@/components/dashboard/BeneficiaryCard";

const beneficiaries = [
  { name: "Emily Carter", bank: "Atlas Bank", account: "********4582" },
  { name: "Daniel Morgan", bank: "JPMorgan Chase", account: "********2014" },
  { name: "Sarah Williams", bank: "Citibank", account: "********9012" },
];

export default function TransferPage() {
  return (
    <main className="dashboard-page transfer-page">
      <Sidebar />

      <section className="dashboard-main">
        <TopNavbar userName="Daniel Morgan" />

        <section className="transfer-shell">
          <div className="transfer-header">
            <div>
              <p className="eyebrow">Funds movement</p>
              <h1>Transfer money</h1>
              <p>Initiate secure transfers to domestic and international recipients with a premium banking experience.</p>
            </div>
          </div>

          <div className="transfer-grid">
            <TransferForm />
          </div>

          <section className="beneficiaries-section" aria-labelledby="beneficiaries-title">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Saved recipients</p>
                <h3 id="beneficiaries-title">Recent beneficiaries</h3>
              </div>
            </div>

            <div className="beneficiary-list">
              {beneficiaries.map((beneficiary) => (
                <BeneficiaryCard key={beneficiary.name} {...beneficiary} />
              ))}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}
