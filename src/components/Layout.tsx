import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import { useCookies } from "../store/cookies";
import { isAdmin } from "../utils/admin";
import { supabase } from "../supabaseClient";
import CookieBanner from "./CookieBanner";
import { logoImage } from '../utils/images';

interface Category {
  id: string;
  name: string;
}
interface Weapon {
  id: string;
  name: string;
  category: string;
}

interface SearchResult {
  id: string;
  name: string;
  image: string;
  weapon: string;
  rarity_color: string;
  wears_extended?: Array<{
    wear: string;
    price: number;
    enabled: boolean;
  }>;
}

export default function Layout() {
  const { user, checkSession } = useAuth();
  const { acceptCookies, declineCookies } = useCookies();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    setIsPageLoading(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Hide loading indicator after a short delay to allow content to load
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

  useEffect(() => {
    checkSession();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: catData } = await supabase.from("categories").select();
      setCategories(catData || []);
    };
    fetchData();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearching(true);
    
    // First try exact/partial matches
    const { data: exactMatches } = await supabase
      .from("skins")
      .select("id, name, image, weapon, rarity_color, wears_extended")
      .ilike("name", `%${query}%`)
      .limit(10);
    
    // If we have enough exact matches, use those
    if (exactMatches && exactMatches.length >= 5) {
      setSearchResults(exactMatches);
      setShowSearchResults(true);
      setSearching(false);
      return;
    }
    
    // For fuzzy search, we'll use multiple search terms
    const searchTerms = generateSearchTerms(query);
    let allResults: SearchResult[] = [];
    
    // Search with each term
    for (const term of searchTerms) {
      const { data } = await supabase
        .from("skins")
        .select("id, name, image, weapon, rarity_color, wears_extended")
        .ilike("name", `%${term}%`)
        .limit(20);
      
      if (data) {
        allResults = [...allResults, ...data];
      }
    }
    
    // Remove duplicates and sort by relevance
    const uniqueResults = removeDuplicates(allResults);
    const sortedResults = sortByRelevance(uniqueResults, query);
    
    setSearchResults(sortedResults.slice(0, 10));
    setShowSearchResults(true);
    setSearching(false);
  };

  const generateSearchTerms = (query: string): string[] => {
    const terms = [query];
    const lowerQuery = query.toLowerCase();
    
    // Common letter substitutions for typos
    const substitutions: { [key: string]: string[] } = {
      'a': ['q', 'z', 's'],
      'e': ['w', 'd', 'r'],
      'i': ['u', 'o', 'k'],
      'o': ['i', 'p', 'l'],
      'u': ['y', 'i', 'h'],
      's': ['a', 'd', 'z'],
      'd': ['s', 'e', 'f'],
      'f': ['d', 'g', 'r'],
      'g': ['f', 'h', 't'],
      'h': ['g', 'j', 'y'],
      'j': ['h', 'k', 'u'],
      'k': ['j', 'l', 'i'],
      'l': ['k', ';', 'o'],
      'z': ['a', 's', 'x'],
      'x': ['z', 'c', 's'],
      'c': ['x', 'v', 'd'],
      'v': ['c', 'b', 'g'],
      'b': ['v', 'n', 'g'],
      'n': ['b', 'm', 'h'],
      'm': ['n', ',', 'j']
    };
    
    // Generate variations with common typos
    for (let i = 0; i < lowerQuery.length; i++) {
      const char = lowerQuery[i];
      if (substitutions[char]) {
        for (const sub of substitutions[char]) {
          const variation = lowerQuery.slice(0, i) + sub + lowerQuery.slice(i + 1);
          terms.push(variation);
        }
      }
    }
    
    // Add partial matches (remove last character)
    if (lowerQuery.length > 2) {
      terms.push(lowerQuery.slice(0, -1));
    }
    
    // Add common word variations
    const wordVariations: { [key: string]: string[] } = {
      'ak': ['ak47', 'ak-47'],
      'm4': ['m4a1', 'm4a1s'],
      'awp': ['awp'],
      'usp': ['usp-s'],
      'glock': ['glock-18'],
      'p250': ['p250'],
      'deagle': ['desert eagle', 'desert'],
      'nova': ['nova'],
      'mag7': ['mag-7'],
      'negev': ['negev'],
      'm249': ['m249'],
      'mp9': ['mp9'],
      'mac10': ['mac-10', 'mac10'],
      'ump45': ['ump-45', 'ump'],
      'p90': ['p90'],
      'ppbizon': ['pp-bizon', 'bizon'],
      'famas': ['famas'],
      'galil': ['galil ar'],
      'aug': ['aug'],
      'sg553': ['sg 553', 'sg-553'],
      'scar20': ['scar-20', 'scar'],
      'g3sg1': ['g3sg1'],
      'cz75': ['cz75-auto', 'cz'],
      'tec9': ['tec-9', 'tec9'],
      'fiveseven': ['five-seven', 'fiveseven'],
      'dual': ['dual berettas', 'dual'],
      'p2000': ['p2000'],
      'r8': ['r8 revolver', 'revolver'],
      'knife': ['knives'],
      'glove': ['gloves']
    };
    
    for (const [word, variations] of Object.entries(wordVariations)) {
      if (lowerQuery.includes(word)) {
        terms.push(...variations);
      }
    }
    
    return [...new Set(terms)]; // Remove duplicates
  };

  const removeDuplicates = (results: SearchResult[]): SearchResult[] => {
    const seen = new Set();
    return results.filter(result => {
      if (seen.has(result.id)) {
        return false;
      }
      seen.add(result.id);
      return true;
    });
  };

  const sortByRelevance = (results: SearchResult[], query: string): SearchResult[] => {
    const lowerQuery = query.toLowerCase();
    
    return results.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // Exact match gets highest priority
      if (aName === lowerQuery && bName !== lowerQuery) return -1;
      if (bName === lowerQuery && aName !== lowerQuery) return 1;
      
      // Starts with query gets second priority
      if (aName.startsWith(lowerQuery) && !bName.startsWith(lowerQuery)) return -1;
      if (bName.startsWith(lowerQuery) && !aName.startsWith(lowerQuery)) return 1;
      
      // Contains query gets third priority
      if (aName.includes(lowerQuery) && !bName.includes(lowerQuery)) return -1;
      if (bName.includes(lowerQuery) && !aName.includes(lowerQuery)) return 1;
      
      // Alphabetical order for same relevance
      return aName.localeCompare(bName);
    });
  };

  const handleSearchResultClick = (skinId: string) => {
    setShowSearchResults(false);
    setSearchQuery("");
    navigate(`/skins/${skinId}`);
  };

  const getPriceRange = (wears_extended: any[] | null | undefined) => {
    if (!wears_extended) return null;
    const enabled = wears_extended.filter(w => w.enabled);
    const fn = enabled.find(w => w.wear === "FN");
    const bs = enabled.find(w => w.wear === "BS");
    if (fn && bs) return `$${bs.price} - $${fn.price}`;
    if (fn) return `$${fn.price}`;
    if (bs) return `$${bs.price}`;
    return null;
  };



  return (
    <div className="min-h-screen bg-dark-bg-primary text-dark-text-primary flex flex-col">
      {/* Top Navigation */}
      <nav className="glass-card border-b border-dark-border-primary/60 sticky top-0 z-40 shadow-dark-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <img 
                  src={logoImage} 
                  alt="SkinVault Logo" 
                  className="w-12 h-12 object-contain"
                />
                <span className="text-xl font-bold text-gradient tracking-tight">SkinVault</span>
              </Link>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                <Link to="/sticker-crafts" className="nav-link">Sticker Crafts</Link>
                <Link to="/loadouts" className="nav-link">Loadouts</Link>
                <Link to="/resell-tracker" className="nav-link">Resell Tracker</Link>
                {user && isAdmin(user) && (
                  <div className="flex items-center gap-4">
                    <span className="text-dark-text-muted">|</span>
                    <Link to="/admin" className="nav-link text-accent-warning">Admin</Link>
                    <Link to="/admin/loadouts" className="nav-link text-accent-warning">Loadouts</Link>
                    <Link to="/admin/sticker-crafts" className="nav-link text-accent-warning">Crafts</Link>
                  </div>
                )}
              </div>
            </div>
            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8 hidden lg:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-dark-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search skins..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="input-dark w-full pl-10 pr-4 shadow-none"
                />
                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 glass-card max-h-96 overflow-y-auto scrollbar-dark animate-fade-in border border-dark-border-primary/60">
                    {searching ? (
                      <div className="p-4 text-dark-text-muted text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin-slow w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full"></div>
                          <span>Searching...</span>
                        </div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="p-2">
                        {searchResults.map(skin => (
                          <button
                            key={skin.id}
                            onClick={() => handleSearchResultClick(skin.id)}
                            className="w-full p-3 hover:bg-dark-bg-tertiary/50 rounded-xl text-left flex items-center gap-3 transition-all duration-200"
                          >
                            <img 
                              src={skin.image} 
                              alt={skin.name} 
                              className="w-10 h-10 object-contain rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-dark-text-primary truncate">{skin.name}</div>
                              <div className="text-sm text-dark-text-muted">{skin.weapon}</div>
                              {getPriceRange(skin.wears_extended) && (
                                <div className="text-sm text-accent-success font-medium">
                                  {getPriceRange(skin.wears_extended)}
                                </div>
                              )}
                            </div>
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0 border border-dark-border-primary" 
                              style={{ background: skin.rarity_color }}
                            />
                          </button>
                        ))}
                      </div>
                    ) : searchQuery.trim().length >= 2 ? (
                      <div className="p-4 text-dark-text-muted text-center">No skins found</div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
            {/* User Menu */}
            <div className="flex items-center gap-4">
              {/* Search Icon - Mobile */}
              <button
                onClick={() => setShowSearchModal(true)}
                className="md:hidden p-2 rounded-xl hover:bg-dark-bg-tertiary transition-colors duration-200 border border-dark-border-primary/60"
                aria-label="Search"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              {/* Desktop Profile/Login */}
              <div className="hidden md:flex items-center gap-4">
                {user ? (
                  <Link to="/profile" className="btn-primary min-w-[90px] h-10 flex items-center justify-center">Profile</Link>
                ) : (
                  <Link to="/login" className="btn-primary min-w-[90px] h-10 flex items-center justify-center">Login</Link>
                )}
              </div>
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-dark-bg-tertiary transition-colors duration-200 border border-dark-border-primary/60"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass-card border-t border-dark-border-primary/60 animate-slide-down rounded-b-2xl">
            <div className="px-4 py-4 space-y-4">
              <Link to="/sticker-crafts" onClick={() => setIsMobileMenuOpen(false)} className="block nav-link py-2">Sticker Crafts</Link>
              <Link to="/loadouts" onClick={() => setIsMobileMenuOpen(false)} className="block nav-link py-2">Loadouts</Link>
              <Link to="/resell-tracker" onClick={() => setIsMobileMenuOpen(false)} className="block nav-link py-2">Resell Tracker</Link>
              {user ? (
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block btn-primary w-full text-center">Profile</Link>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block btn-primary w-full text-center">Login</Link>
              )}
              {user && isAdmin(user) && (
                <>
                  <div className="border-t border-dark-border-primary/60 pt-4">
                    <div className="text-sm text-dark-text-muted mb-2">Admin</div>
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block nav-link text-accent-warning py-2">Dashboard</Link>
                    <Link to="/admin/loadouts" onClick={() => setIsMobileMenuOpen(false)} className="block nav-link text-accent-warning py-2">Loadouts</Link>
                    <Link to="/admin/sticker-crafts" onClick={() => setIsMobileMenuOpen(false)} className="block nav-link text-accent-warning py-2">Crafts</Link>
                  </div>
                </>
              )}

            </div>
          </div>
        )}
      </nav>
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden lg:block w-80 bg-dark-bg-secondary/90 border-r border-dark-border-primary/60 p-6 rounded-tr-2xl shadow-dark-lg">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-dark-text-primary mb-4 tracking-tight">Categories</h2>
              <div className="space-y-2">
                {categories.map(cat => {
                  const isActive = window.location.pathname.includes(`/category/${encodeURIComponent(cat.name)}`);
                  return (
                              <Link
                      key={cat.id}
                      to={`/category/${encodeURIComponent(cat.name)}`}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 font-semibold ${
                        isActive 
                          ? 'bg-dark-bg-tertiary text-dark-text-primary' 
                          : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-tertiary/50'
                      }`}
                              >
                      {cat.name}
                              </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
        {/* Main Content Area */}
        <main className="flex-1 bg-dark-bg-primary min-h-[calc(100vh-4rem)] overflow-x-hidden relative">
          {isPageLoading && (
            <div className="absolute top-0 left-0 right-0 z-10">
              <div className="h-1 bg-gradient-to-r from-accent-primary to-accent-secondary animate-pulse"></div>
            </div>
          )}
          <div className={`p-4 sm:p-6 transition-opacity duration-200 ${isPageLoading ? 'opacity-50' : 'opacity-100'}`}>
            <Outlet />
          </div>
        </main>
      </div>
      {/* Footer */}
      <footer className="glass-card border-t border-dark-border-primary/60 mt-auto rounded-b-2xl shadow-dark-lg overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Data Sources Notice */}
            <div className="text-center">
              <p className="text-xs sm:text-sm text-dark-text-muted leading-relaxed">
                <span className="font-medium text-dark-text-secondary">Data Sources:</span> Skin prices provided by{' '}
                <a 
                  href="https://csfloat.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent-primary hover:text-accent-primary/80 transition-colors duration-200"
                >
                  CS Float
                </a>
                . All skin data from{' '}
                <a 
                  href="https://store.steampowered.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent-primary hover:text-accent-primary/80 transition-colors duration-200"
                >
                  Steam/Valve
                </a>
                . Data obtained via{' '}
                <a 
                  href="https://github.com/ByMykel/CSGO-API" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent-primary hover:text-accent-primary/80 transition-colors duration-200"
                >
                  CSGO-API
                </a>
                .
              </p>
            </div>
            
            {/* Footer Links */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
              <div className="flex items-center gap-2">
                <img 
                  src={logoImage} 
                  alt="SkinVault Logo" 
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
                <span className="text-xs sm:text-sm text-dark-text-secondary">© 2025 SkinVault. All rights reserved.</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
                <Link to="/legal-notice" className="nav-link">Legal Notice</Link>
                <Link to="/privacy-policy" className="nav-link">Privacy Policy</Link>
                <Link to="/terms-of-service" className="nav-link">Terms of Service</Link>
                <Link to="/contact" className="nav-link">Contact</Link>
                <Link to="/cookie-settings" className="nav-link">Cookie Settings</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" onClick={() => setShowSearchModal(false)}>
          <div className="bg-dark-bg-primary w-full h-full m-0 rounded-none absolute w-full h-auto m-0 rounded-2xl max-w-2xl mx-auto shadow-xl overflow-y-auto max-h-[80vh] p-4">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-dark-bg-primary z-10 pb-4 px-4 border-b border-dark-border-primary/60">
              <h3 className="text-xl font-semibold">Search Skins</h3>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-dark-text-muted hover:text-dark-text-primary text-2xl px-2 bg-dark-bg-secondary rounded-full w-8 h-8 flex items-center justify-center hover:bg-dark-bg-tertiary transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="px-4">
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-dark-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search skins..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="input-dark w-full pl-10 pr-4 shadow-none"
                  autoFocus
                />
              </div>
              {showSearchResults && (
                <div className="space-y-2">
                  {searching ? (
                    <div className="p-4 text-dark-text-muted text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin-slow w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full"></div>
                        <span>Searching...</span>
                      </div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map(skin => (
                        <button
                          key={skin.id}
                          onClick={() => {
                            handleSearchResultClick(skin.id);
                            setShowSearchModal(false);
                          }}
                          className="w-full p-3 hover:bg-dark-bg-tertiary/50 rounded-xl text-left flex items-center gap-3 transition-all duration-200"
                        >
                          <img 
                            src={skin.image} 
                            alt={skin.name} 
                            className="w-10 h-10 object-contain rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-dark-text-primary truncate">{skin.name}</div>
                            <div className="text-sm text-dark-text-muted">{skin.weapon}</div>
                            {getPriceRange(skin.wears_extended) && (
                              <div className="text-sm text-accent-success font-medium">
                                {getPriceRange(skin.wears_extended)}
                              </div>
                            )}
                          </div>
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0 border border-dark-border-primary" 
                            style={{ background: skin.rarity_color }}
                          />
                        </button>
                      ))}
                    </div>
                  ) : searchQuery.trim().length >= 2 ? (
                    <div className="p-4 text-dark-text-muted text-center">No skins found</div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cookie Banner */}
      <CookieBanner 
        onAccept={acceptCookies}
        onDecline={declineCookies}
      />
    </div>
  );
} 