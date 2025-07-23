import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { isAdmin } from '../utils/admin';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!isAdmin(user)) {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  if (!user || !isAdmin(user)) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold mb-4 text-gradient tracking-tight drop-shadow-lg">Admin Dashboard</h1>
        <p className="text-lg text-dark-text-tertiary mb-8">Manage official content for the community</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="glass-card rounded-2xl shadow-dark-lg border border-dark-border-primary/60 p-8 flex flex-col justify-between">
          <h2 className="text-2xl font-bold mb-4 text-dark-text-primary tracking-tight">Loadouts</h2>
          <p className="text-dark-text-secondary mb-6">
            Create and manage official loadouts that will be visible to all users.
          </p>
          <Link
            to="/admin/loadouts"
            className="btn-primary text-lg font-semibold px-8 py-3 mt-auto"
          >
            Manage Loadouts
          </Link>
        </div>
        <div className="glass-card rounded-2xl shadow-dark-lg border border-dark-border-primary/60 p-8 flex flex-col justify-between">
          <h2 className="text-2xl font-bold mb-4 text-dark-text-primary tracking-tight">Sticker Crafts</h2>
          <p className="text-dark-text-secondary mb-6">
            Create and manage sticker crafts with detailed information and images.
          </p>
          <Link
            to="/admin/sticker-crafts"
            className="btn-primary text-lg font-semibold px-8 py-3 mt-auto"
          >
            Manage Crafts
          </Link>
        </div>
      </div>
      <div className="mt-12 p-6 glass-card rounded-2xl border-l-4 border-accent-warning/80 bg-accent-warning/10">
        <h3 className="font-bold text-accent-warning mb-2 text-lg">Admin Information</h3>
        <p className="text-dark-text-tertiary text-base">
          You are logged in as an admin user. All changes you make will be visible to the community immediately.<br/>
          Official loadouts and sticker crafts you create will appear in the main sections of the app.
        </p>
      </div>
    </div>
  );
} 