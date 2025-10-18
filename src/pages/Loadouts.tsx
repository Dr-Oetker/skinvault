import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../store/auth";
import SEO, { SEOPresets } from "../components/SEO";
import { selectFrom } from "../utils/supabaseApi";

interface Loadout {
  id: string;
  title: string;
  description?: string;
  budget?: number;
  created_at: string;
  loadout_type: 'user' | 'loadout';
}

export default function Loadouts() {
  const { user } = useAuth();
  const [userLoadouts, setUserLoadouts] = useState<Loadout[]>([]);
  const [loadouts, setLoadouts] = useState<Loadout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoadouts = async () => {
      setLoading(true);
      
      // Fetch user loadouts if logged in
      if (user) {
        const { data: userData } = await selectFrom('user_loadouts', {
          select: 'id, title, description, budget, created_at',
          eq: { user_id: user.id },
          order: { column: 'created_at', ascending: false }
        });
        
        if (userData) {
          setUserLoadouts((userData as any).map((loadout: any) => ({ ...loadout, loadout_type: 'user' as const })));
        }
      }

      // Fetch loadouts (previously 'official_loadouts')
      const { data: loadoutData } = await selectFrom('official_loadouts', {
        select: 'id, title, description, created_at',
        order: { column: 'created_at', ascending: false },
        limit: 6
      });
      
      if (loadoutData) {
        setLoadouts(loadoutData.map((loadout: any) => ({ ...loadout, loadout_type: 'loadout' as const })));
      }

      setLoading(false);
    };

    fetchLoadouts();
  }, [user]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-24">
          <div className="flex items-center justify-center mb-6">
            <div className="animate-spin-slow w-10 h-10 border-2 border-accent-primary border-t-transparent rounded-full"></div>
          </div>
          <p className="text-dark-text-muted text-lg">Loading loadouts...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO {...SEOPresets.loadouts} />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-dark-text-primary mb-4 tracking-tight text-gradient drop-shadow-lg">Loadouts</h1>
          <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto font-medium">
            Discover curated weapon loadouts and create your own perfect combinations. 
            From budget-friendly to premium setups, find your ideal loadout.
          </p>
        </div>
        
        {/* Personal Loadouts Section */}
        {user && (
          <div className="mb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-dark-text-primary mb-2 tracking-tight">Personal Loadouts</h2>
                <p className="text-dark-text-secondary">Your personal weapon combinations</p>
              </div>
              <Link 
                to="/loadouts/new" 
                className="btn-primary mt-4 sm:mt-0 text-lg font-semibold flex items-center gap-2 shadow-dark-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Loadout
              </Link>
            </div>
            
            {userLoadouts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Create New Loadout Card */}
                <Link to="/loadouts/new" className="block h-full">
                  <div className="glass-card p-10 text-center border-2 border-dashed border-dark-border-primary/60 hover:border-accent-primary hover:bg-dark-bg-tertiary/30 transition-all duration-300 group h-full min-h-[240px] flex flex-col justify-center rounded-2xl shadow-dark-lg">
                    <div className="w-16 h-16 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glow">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div className="text-lg font-semibold text-dark-text-primary mb-2">Create New Loadout</div>
                    <div className="text-sm text-dark-text-secondary">Start building your perfect loadout</div>
                  </div>
                </Link>
                
                {/* User Loadout Cards */}
                {userLoadouts.map(loadout => (
                  <Link key={loadout.id} to={`/loadouts/user/${loadout.id}`} className="block h-full">
                    <div className="glass-card p-8 card-hover group h-full min-h-[240px] flex flex-col justify-between rounded-2xl shadow-dark-lg border border-dark-border-primary/60">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-dark-text-primary group-hover:text-accent-primary transition-colors duration-200 tracking-tight">
                          {loadout.title}
                        </h3>
                        <span className="badge badge-primary">Personal</span>
                      </div>
                      {loadout.description && (
                        <p className="text-dark-text-secondary text-base mb-4 line-clamp-2">
                          {loadout.description}
                        </p>
                      )}
                      <div className="flex justify-between items-center text-sm text-dark-text-muted">
                        <span>Created {formatDate(loadout.created_at)}</span>
                        {loadout.budget && (
                          <span className="font-medium text-accent-success">${loadout.budget}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="glass-card p-14 max-w-md mx-auto rounded-2xl shadow-dark-lg">
                  <div className="text-dark-text-muted mb-6">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-dark-text-primary mb-2">No Loadouts Yet</h3>
                  <p className="text-dark-text-secondary mb-6">Start creating your perfect weapon combinations</p>
                  <Link 
                    to="/loadouts/new" 
                    className="btn-primary text-lg font-semibold"
                  >
                    Create Your First Loadout
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loadouts Section */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-dark-text-primary mb-2 tracking-tight">Loadouts</h2>
              <p className="text-dark-text-secondary">Curated by our experts</p>
            </div>
            <Link 
              to="/loadouts" 
              className="text-accent-primary hover:text-accent-secondary font-semibold transition-colors duration-200 mt-4 sm:mt-0 text-lg"
            >
              View All Loadouts →
            </Link>
          </div>
          
          {loadouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loadouts.map(loadout => (
                <Link key={loadout.id} to={`/loadouts/loadout/${loadout.id}`} className="block h-full">
                  <div className="glass-card p-8 card-hover group h-full min-h-[240px] flex flex-col justify-between rounded-2xl shadow-dark-lg border border-dark-border-primary/60">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-dark-text-primary group-hover:text-accent-primary transition-colors duration-200 tracking-tight">
                        {loadout.title}
                      </h3>
                      <span className="badge badge-success">Curated</span>
                    </div>
                    {loadout.description && (
                      <p className="text-dark-text-secondary text-base mb-4 line-clamp-2">
                        {loadout.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-dark-text-muted">
                      <span>Created {formatDate(loadout.created_at)}</span>
                      <svg className="w-4 h-4 group-hover:text-accent-primary transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="glass-card p-14 max-w-md mx-auto rounded-2xl shadow-dark-lg">
                <div className="text-dark-text-muted mb-6">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-dark-text-primary mb-2">No Loadouts Available</h3>
                <p className="text-dark-text-secondary">Check back soon for curated loadouts</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 