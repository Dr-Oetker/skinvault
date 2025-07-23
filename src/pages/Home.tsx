import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import SEO, { SEOPresets } from "../components/SEO";

interface Loadout {
  id: string;
  title: string;
  description: string;
}

interface StickerCraft {
  id: string;
  name: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
}
interface Weapon {
  id: string;
  name: string;
  category: string;
}

export default function Home() {
  const [loadouts, setLoadouts] = useState<Loadout[]>([]);
  const [crafts, setCrafts] = useState<StickerCraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSkinsMenu, setShowSkinsMenu] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: loadoutsData } = await supabase
        .from("official_loadouts")
        .select("id, title, description")
        .order("created_at", { ascending: false })
        .limit(3);
      setLoadouts(loadoutsData || []);

      const { data: craftsData } = await supabase
        .from("sticker_crafts")
        .select("id, name, description")
        .order("created_at", { ascending: false })
        .limit(3);
      setCrafts(craftsData || []);

      // Fetch categories and weapons for mobile skins menu
      const { data: catData } = await supabase.from("categories").select();
      setCategories(catData || []);
      const { data: weaponData } = await supabase.from("weapons").select();
      setWeapons(weaponData || []);

      setLoading(false);
    };
    fetchData();
  }, []);

  // Card component for reuse
  function Card({ title, description, to }: { title: string; description?: string; to: string }) {
    return (
      <Link to={to} className="glass-card flex flex-col justify-between min-h-[100px] min-w-0 w-full p-4 sm:p-5 card-hover group transition-all duration-300">
        <div className="flex-1 flex flex-col justify-between">
          <div className="font-semibold text-dark-text-primary text-base sm:text-lg mb-1 truncate">{title || "Untitled"}</div>
          <div className="text-dark-text-secondary text-xs sm:text-sm line-clamp-2 mb-2">{description || <span className="italic text-dark-text-muted">No description</span>}</div>
        </div>
        <div className="flex items-center justify-end mt-2">
          <svg className="w-5 h-5 text-dark-text-muted group-hover:text-accent-primary transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    );
  }

  // Mobile Skins Menu
  function SkinsMenu() {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:hidden">
        <div className="w-full bg-dark-bg-modal rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-dark-text-primary">Browse Skins</h3>
            <button onClick={() => setShowSkinsMenu(false)} className="text-dark-text-muted hover:text-accent-primary text-2xl px-2">&times;</button>
          </div>
          <div className="space-y-2">
            {categories.map(cat => {
              const catWeapons = weapons.filter(w => w.category === cat.name);
              return (
                <div key={cat.id}>
                  <button
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-dark-bg-tertiary/50 transition-colors duration-200 font-medium text-dark-text-secondary hover:text-dark-text-primary flex items-center justify-between"
                    onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                  >
                    <span>{cat.name}</span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${expandedCat === cat.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedCat === cat.id && (
                    <div className="ml-4 space-y-1 animate-slide-down">
                      {catWeapons.length > 0 ? catWeapons.map(w => (
                        <button
                          key={w.id}
                          className="block px-3 py-2 text-sm text-dark-text-muted hover:text-accent-primary transition-colors duration-200 rounded w-full text-left"
                          onClick={() => {
                            setShowSkinsMenu(false);
                            navigate(`/weapons/${encodeURIComponent(w.name)}`);
                          }}
                        >
                          {w.name}
                        </button>
                      )) : (
                        <div className="px-3 py-2 text-sm text-dark-text-disabled italic">No weapons</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO {...SEOPresets.home} />
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center py-20 px-4 bg-dark-bg-secondary/80 rounded-2xl shadow-dark-lg mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-gradient tracking-tight drop-shadow-lg">
            Welcome to SkinVault
          </h1>
          <p className="text-xl text-dark-text-secondary mb-10 max-w-3xl mx-auto font-medium">
            Your ultimate hub for CS 2 skins, sticker crafts, and loadouts. Discover, create, and track your favorite items.
          </p>
          {/* Mobile only: View Skins button */}
          <div className="flex flex-col gap-4 justify-center md:hidden">
            <button
              className="btn-primary w-full max-w-xs mx-auto text-lg font-semibold shadow-dark-lg"
              onClick={() => setShowSkinsMenu(true)}
            >
              View Skins
            </button>
          </div>
        </div>
        {showSkinsMenu && <SkinsMenu />}
        {/* Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 px-2 sm:px-4 mb-16">
          {/* Latest Loadouts */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-dark-text-primary tracking-tight">Latest Loadouts</h2>
              <Link to="/loadouts" className="text-accent-primary hover:text-accent-secondary transition-colors duration-200 font-semibold text-base">
                View all →
              </Link>
            </div>
            {loading ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass-card p-6 min-h-[120px] w-full animate-pulse flex-1 rounded-2xl"></div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 flex-wrap">
                {loadouts.length > 0 ? loadouts.map(loadout => (
                  <Card key={loadout.id} title={loadout.title} description={loadout.description} to={`/loadouts/official/${loadout.id}`} />
                )) : (
                  <div className="glass-card p-8 text-center min-h-[120px] w-full flex items-center justify-center rounded-2xl">
                    <span className="text-dark-text-muted">No loadouts available yet.</span>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Latest Sticker Crafts */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-dark-text-primary tracking-tight">Latest Sticker Crafts</h2>
              <Link to="/sticker-crafts" className="text-accent-primary hover:text-accent-secondary transition-colors duration-200 font-semibold text-base">
                View all →
              </Link>
            </div>
            {loading ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass-card p-6 min-h-[120px] w-full animate-pulse flex-1 rounded-2xl"></div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 flex-wrap">
                {crafts.length > 0 ? crafts.map(craft => (
                  <Card key={craft.id} title={craft.name} description={craft.description} to={`/sticker-crafts/${craft.id}`} />
                )) : (
                  <div className="glass-card p-8 text-center min-h-[120px] w-full flex items-center justify-center rounded-2xl">
                    <span className="text-dark-text-muted">No sticker crafts available yet.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="px-2 sm:px-4 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-text-primary mb-4">
              Why Choose SkinVault?
            </h2>
            <p className="text-lg text-dark-text-secondary max-w-2xl mx-auto">
              The ultimate platform for CS 2 enthusiasts to manage, track, and discover the best skins and combinations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-6 rounded-2xl text-center">
              <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-dark-text-primary mb-2">Real-time Pricing</h3>
              <p className="text-dark-text-secondary">
                Get up-to-date prices and market trends for all CS 2 skins with our comprehensive tracking system.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl text-center">
              <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-dark-text-primary mb-2">Curated Loadouts</h3>
              <p className="text-dark-text-secondary">
                Discover expertly crafted loadouts with the best skin and sticker combinations for every weapon.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl text-center">
              <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-dark-text-primary mb-2">Investment Tracking</h3>
              <p className="text-dark-text-secondary">
                Monitor your skin investments and track price changes to maximize your returns in the CS 2 market.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 