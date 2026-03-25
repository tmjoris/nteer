import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../lib/auth';

export default function SupervisorApproval() {
  const { profile } = useAuth();
  const status = profile?.supervisorStatus ?? 'pending';

  const title =
    status === 'approved'
      ? 'Approved'
      : status === 'rejected'
        ? 'Rejected'
        : 'Pending Review';

  const message =
    status === 'approved'
      ? 'Your supervisor account is approved. You can now list sites.'
      : status === 'rejected'
        ? 'Your supervisor request was rejected. Contact support if you think this is a mistake.'
        : 'Your supervisor request is pending. An admin must approve you before you can list sites.';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-brand-50 pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] border border-brand-100 shadow-sm p-10">
          <div className="text-xs font-bold uppercase tracking-widest text-brand-400">Supervisor Access</div>
          <h1 className="mt-3 text-3xl font-serif font-bold text-brand-950">{title}</h1>
          <p className="mt-4 text-brand-500 leading-relaxed">{message}</p>
          <div className="mt-8 p-5 rounded-2xl bg-brand-50 border border-brand-100 text-sm text-brand-600">
            Current status: <span className="font-bold text-brand-950">{status}</span>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

