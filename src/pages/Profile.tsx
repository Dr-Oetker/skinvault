import { useState, useEffect } from "react";
import { useAuth } from "../store/auth";
import { useFavorites } from "../store/favorites";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import ResellTrackerModal from '../components/ResellTrackerModal';
import { selectFrom, deleteFrom, updateTable } from '../utils/supabaseApi';

interface UserLoadout {
  id: string;
  title: string;
  description: string;
  budget?: number;
  created_at: string;
}

interface FavoriteSkin {
  id: string;
  name: string;
  image: string;
  weapon: string;
  rarity_color: string;
  wears_extended?: Array<{
    wear: string;
    price: number;
    enabled: boolean;
    variant: 'normal' | 'stattrak' | 'souvenir';
  }>;
}

interface TrackerEntry {
  id: string;
  skin_id: string;
  buy_price: number;
  wear_value?: number | null;
  wear?: string | null;
  notes?: string | null;
  bought_at: string;
  created_at: string;
  updated_at: string;
  skin?: {
    id: string;
    name: string;
    image: string;
    wears_extended?: Array<{
      wear: string;
      price: number;
      enabled: boolean;
      variant: 'normal' | 'stattrak' | 'souvenir';
    }>;
    last_price_update?: string;
  };
}

type TabType = 'favorites' | 'loadouts' | 'tracker';

export default function Profile() {
  const { user, checkSession, logout } = useAuth();
  const { favoriteSkinIds, fetchFavorites, addFavorite, removeFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState<TabType>('favorites');
  const [favorites, setFavorites] = useState<FavoriteSkin[]>([]);
  const [loadouts, setLoadouts] = useState<UserLoadout[]>([]);
  const [trackers, setTrackers] = useState<TrackerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [loadoutsLoading, setLoadoutsLoading] = useState(false);
  const [trackersLoading, setTrackersLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  // Add state for editing and deleting trackers
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTracker, setEditingTracker] = useState<TrackerEntry | null>(null);
  const [editFormData, setEditFormData] = useState({
    buy_price: "",
    wear_value: "",
    wear: "",
    notes: "",
    bought_at: ""
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const initializeProfile = async () => {
      setLoading(true);
      await checkSession();
    };
    initializeProfile();
    // eslint-disable-next-line
  }, []);

  // Initial load when user is available
  useEffect(() => {
    if (user) {
      fetchFavorites(user.id);
    }
  }, [user]);

  // Load tab data when user or active tab changes
  useEffect(() => {
    if (user) {
      loadTabData(activeTab);
    }
  }, [user, activeTab]);

  // Set main loading to false once we have user and the active tab data is loaded
  useEffect(() => {
    if (user) {
      const isActiveTabLoaded = 
        (activeTab === 'favorites' && !favoritesLoading) ||
        (activeTab === 'loadouts' && !loadoutsLoading) ||
        (activeTab === 'tracker' && !trackersLoading);
      
      if (isActiveTabLoaded) {
        setLoading(false);
      }
    }
  }, [user, activeTab, favoritesLoading, loadoutsLoading, trackersLoading]);

  const loadTabData = async (tab: TabType) => {
    if (!user) return;

    switch (tab) {
      case 'favorites':
        await loadFavorites();
        break;
      case 'loadouts':
        await loadLoadouts();
        break;
      case 'tracker':
        await loadTrackers();
        break;
    }
  };

  const loadFavorites = async () => {
    if (!user) return;
    
    // Always set loading to true initially for the active tab
    setFavoritesLoading(true);
    
    try {
      // First fetch the favorite IDs from the store
      await fetchFavorites(user.id);
      
      // Then fetch the actual skin data for those IDs
      if (favoriteSkinIds.length > 0) {
        const { data } = await selectFrom("skins", {
          select: "id, name, image, weapon, rarity_color, wears_extended",
          in: { id: favoriteSkinIds }
        });
        
        if (data) {
          setFavorites(data as FavoriteSkin[]);
        }
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const loadLoadouts = async () => {
    if (!user) return;
    setLoadoutsLoading(true);
    
    const { data } = await selectFrom("user_loadouts", {
      eq: { user_id: user.id },
      order: { column: "created_at", ascending: false }
    });
    
    setLoadouts(data || []);
    setLoadoutsLoading(false);
  };

  const loadTrackers = async () => {
    if (!user) return;
    setTrackersLoading(true);

    // First, get the tracker entries
    const { data: trackerData } = await selectFrom("resell_tracker", {
      select: "id, skin_id, buy_price, wear_value, wear, notes, bought_at, created_at, updated_at",
      eq: { user_id: user.id },
      order: { column: "created_at", ascending: false }
    });

    if (!trackerData) {
      setTrackers([]);
      setTrackersLoading(false);
      return;
    }

    // Then, fetch skin data for each tracker
    const trackersWithSkins = await Promise.all(
      trackerData.map(async (tracker: any) => {
        const { data: skinData } = await selectFrom("skins", {
          select: "id, name, image, wears_extended, last_price_update",
          eq: { id: tracker.skin_id },
          single: true
        });
        return {
          ...tracker,
          skin: skinData ? {
            id: skinData.id,
            name: skinData.name,
            image: skinData.image,
            wears_extended: skinData.wears_extended,
            last_price_update: skinData.last_price_update
          } : undefined
        };
      })
    );

    setTrackers(trackersWithSkins);
    setTrackersLoading(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validation
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (passwordChange.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    setChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordChange.newPassword
      });

      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess("Password updated successfully!");
        setPasswordChange({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowChangePassword(false);
      }
    } catch (error) {
      setPasswordError("An error occurred while updating password");
    } finally {
      setChangingPassword(false);
    }
  };

  const getPriceRange = (wears_extended: any[] | null | undefined) => {
    if (!wears_extended) return null;
    const enabled = wears_extended.filter(w => w.enabled && w.variant === 'normal');
    const fn = enabled.find(w => w.wear === "FN");
    const bs = enabled.find(w => w.wear === "BS");
    if (fn && bs) return `$${bs.price} - $${fn.price}`;
    if (fn) return `$${fn.price}`;
    if (bs) return `$${bs.price}`;
    return null;
  };

  const getCurrentPrice = (tracker: TrackerEntry) => {
    if (!tracker.skin?.wears_extended) return null;
    const enabled = tracker.skin.wears_extended.filter(w => w.enabled && w.variant === 'normal');
    if (enabled.length === 0) return null;
    
    if (tracker.wear) {
      const wearEntry = enabled.find(w => w.wear === tracker.wear);
      return wearEntry?.price || null;
    }
    
    const avgPrice = enabled.reduce((sum, w) => sum + w.price, 0) / enabled.length;
    return avgPrice;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  // Add helper functions for tracker info display
  const wearRanges = {
    FN: { min: 0.00, max: 0.07, label: "Factory New (FN)" },
    MW: { min: 0.07, max: 0.15, label: "Minimal Wear (MW)" },
    FT: { min: 0.15, max: 0.38, label: "Field-Tested (FT)" },
    WW: { min: 0.38, max: 0.45, label: "Well-Worn (WW)" },
    BS: { min: 0.45, max: 1.00, label: "Battle-Scarred (BS)" }
  };

  const getWearDisplay = (tracker: TrackerEntry) => {
    if (tracker.wear) {
      if (tracker.wear_value !== undefined && tracker.wear_value !== null) {
        return `${tracker.wear} (Float: ${tracker.wear_value.toFixed(4)})`;
      }
      return tracker.wear;
    }
    return "Unknown";
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const getTradeLockInfo = (boughtAt: string) => {
    const purchaseDate = new Date(boughtAt);
    const unlockDate = new Date(purchaseDate);
    unlockDate.setDate(unlockDate.getDate() + 7);
    unlockDate.setHours(9, 0, 0, 0); // 9 AM CET

    const now = new Date();
    const isTradeable = now >= unlockDate;

    return {
      isTradeable,
      unlockDate,
      unlockDateFormatted: unlockDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const handleEdit = (tracker: TrackerEntry) => {
    setEditingTracker(tracker);
    setEditFormData({
      buy_price: tracker.buy_price.toString(),
      wear_value: tracker.wear_value?.toString() || "",
      wear: tracker.wear || "",
      notes: tracker.notes || "",
      bought_at: tracker.bought_at
    });
    setShowEditModal(true);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleDelete = async (trackerId: string) => {
    if (!user) return;
    setDeleting(trackerId);
    const { error } = await deleteFrom("resell_tracker", {
      eq: { id: trackerId, user_id: user.id }
    });
    if (!error) {
      await loadTrackers();
    }
    setDeleting(null);
  };

  const handleEditWearSelect = (wear: string) => {
    setEditFormData(prev => ({ ...prev, wear, wear_value: "" }));
  };
  const handleEditFloatChange = (value: string) => {
    setEditFormData(prev => ({ ...prev, wear_value: value }));
    if (value) {
      const float = parseFloat(value);
      if (!isNaN(float) && float >= 0 && float <= 1) {
        const detectedWear = getWearFromFloat(float);
        setEditFormData(prev => ({ ...prev, wear: detectedWear }));
      }
    }
  };

  // Add getWearFromFloat helper for edit modal
  const getWearFromFloat = (floatValue: number): string => {
    for (const [wear, range] of Object.entries(wearRanges)) {
      if (floatValue >= range.min && floatValue <= range.max) {
        return wear;
      }
    }
    return "";
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-2 sm:px-6">
        <div className="glass-card rounded-2xl shadow-dark-lg border border-dark-border-primary/60 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-6 w-1/3"></div>
            <div className="flex gap-3 mb-8">
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card rounded-2xl p-6">
                  <div className="w-32 h-32 bg-gray-200 rounded mb-4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 glass-card rounded-2xl shadow-dark-lg text-center">
        <h1 className="text-3xl font-bold mb-4 text-dark-text-primary">Login</h1>
        <p className="text-dark-text-muted mb-6 text-lg">Please log in to access your profile.</p>
        <Link to="/login" className="btn-primary text-lg font-semibold px-8 py-3">Go to Login</Link>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto py-10 px-2 sm:px-6">
      <div className="glass-card rounded-2xl shadow-dark-lg border border-dark-border-primary/60 p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2 text-dark-text-primary tracking-tight">Profile</h1>
        <p className="text-dark-text-tertiary mb-6 text-lg">Email: {user.email}</p>
        <div className="flex gap-3 mb-2 flex-wrap">
          <button
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="btn-secondary text-accent-primary border-accent-primary/40 hover:bg-accent-primary/10 text-base px-6 py-2 rounded-lg font-semibold"
          >
            {showChangePassword ? 'Cancel' : 'Change Password'}
          </button>
          <button
            onClick={handleLogout}
            className="btn-secondary text-accent-error border-accent-error/40 hover:bg-accent-error/10 text-base px-6 py-2 rounded-lg font-semibold"
          >
            Logout
          </button>
        </div>
        {/* Change Password Form */}
        {showChangePassword && (
          <div className="mt-6 p-6 bg-dark-bg-secondary/80 rounded-xl border border-dark-border-primary/60">
            <h3 className="text-lg font-semibold mb-4 text-dark-text-primary">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-dark-text-secondary">New Password</label>
                <input
                  type="password"
                  value={passwordChange.newPassword}
                  onChange={(e) => setPasswordChange(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="input-dark w-full"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-dark-text-secondary">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordChange.confirmPassword}
                  onChange={(e) => setPasswordChange(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="input-dark w-full"
                  required
                />
              </div>
              {passwordError && (
                <div className="text-accent-error text-sm">{passwordError}</div>
              )}
              {passwordSuccess && (
                <div className="text-accent-success text-sm">{passwordSuccess}</div>
              )}
              <button
                type="submit"
                disabled={changingPassword}
                className="btn-primary w-full text-lg font-semibold"
              >
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
      {/* Tabs */}
      <div className="glass-card rounded-2xl shadow-dark-lg border border-dark-border-primary/60">
        <div className="border-b border-dark-border-primary/60">
          <nav className="flex flex-wrap">
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-3 sm:px-6 md:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold border-b-2 transition-colors duration-150 flex-1 sm:flex-none text-center ${
                activeTab === 'favorites'
                  ? 'border-accent-primary text-accent-primary bg-dark-bg-tertiary/40'
                  : 'border-transparent text-dark-text-muted hover:text-accent-primary'
              }`}
            >
              Favorites
            </button>
            <button
              onClick={() => setActiveTab('loadouts')}
              className={`px-3 sm:px-6 md:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold border-b-2 transition-colors duration-150 flex-1 sm:flex-none text-center ${
                activeTab === 'loadouts'
                  ? 'border-accent-primary text-accent-primary bg-dark-bg-tertiary/40'
                  : 'border-transparent text-dark-text-muted hover:text-accent-primary'
              }`}
            >
              User Loadouts
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-3 sm:px-6 md:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold border-b-2 transition-colors duration-150 flex-1 sm:flex-none text-center ${
                activeTab === 'tracker'
                  ? 'border-accent-primary text-accent-primary bg-dark-bg-tertiary/40'
                  : 'border-transparent text-dark-text-muted hover:text-accent-primary'
              }`}
            >
              Resell Tracker
            </button>
          </nav>
        </div>
        <div className="p-8">
          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-dark-text-primary tracking-tight">Favorite Skins</h2>
              {favorites.length === 0 ? (
                <div className="text-dark-text-muted text-center py-12 text-lg">
                  You have no favorite skins yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {favorites.map(skin => {
                    const isFavorited = favoriteSkinIds.includes(skin.id);
                    return (
                      <div key={skin.id} className="relative h-full">
                        <Link to={`/skins/${skin.id}`} className="block w-full h-full">
                          <div className="glass-card flex flex-col items-center justify-between h-full min-h-[340px] rounded-2xl p-6 shadow-dark-lg border border-dark-border-primary/60 group hover:scale-105 hover:shadow-dark-lg transition-all duration-200">
                            <img src={skin.image} alt={skin.name} className="w-32 h-32 object-contain mb-2 rounded-xl border border-dark-border-primary/60" />
                            <div className="font-bold mb-1 text-dark-text-primary text-center text-lg">{skin.name}</div>
                            <div className="text-sm text-dark-text-muted mb-1 text-center">{skin.weapon}</div>
                            <div className="text-lg font-bold mb-1 text-accent-success bg-accent-success/10 px-2 py-1 rounded shadow-sm text-center">{getPriceRange(skin.wears_extended) || "-"}</div>
                            <div className="w-4 h-4 rounded-full mt-1 border border-dark-border-primary/60" style={{ background: skin.rarity_color }} title="Rarity"></div>
                          </div>
                        </Link>
                        {user && (
                          <button
                            onClick={e => { e.preventDefault(); e.stopPropagation(); isFavorited ? removeFavorite(user.id, skin.id) : addFavorite(user.id, skin.id); }}
                            className={`absolute top-3 right-4 text-2xl transition-all duration-200 hover:scale-110 ${isFavorited ? 'text-accent-error hover:text-red-400' : 'text-dark-text-muted hover:text-accent-error'}`}
                            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            {isFavorited ? '♥' : '♡'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {/* Loadouts Tab */}
          {activeTab === 'loadouts' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-dark-text-primary tracking-tight">Your Loadouts</h2>
              {loadouts.length === 0 ? (
                <div className="text-dark-text-muted text-center py-12 text-lg">
                  You have no loadouts yet.
                  <br />
                  <Link to="/loadouts" className="text-accent-primary hover:underline font-semibold">Create your first loadout</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {loadouts.map(loadout => (
                    <div key={loadout.id} className="relative h-full">
                      <Link to={`/loadouts/user/${loadout.id}`} className="block w-full h-full">
                        <div className="glass-card flex flex-col justify-between h-full min-h-[180px] rounded-2xl p-6 shadow-dark-lg border border-dark-border-primary/60 group hover:scale-105 hover:shadow-dark-lg transition-all duration-200">
                          <div className="font-bold mb-1 text-dark-text-primary text-lg truncate" title={loadout.title}>{loadout.title}</div>
                          <div className="text-sm text-dark-text-muted mb-2 line-clamp-2" title={loadout.description}>{loadout.description}</div>
                          <div className="flex justify-between items-end mt-auto">
                            <div className="text-xs text-dark-text-muted">Created: {formatDate(loadout.created_at)}</div>
                            {loadout.budget && (
                              <div className="text-sm font-bold text-accent-success bg-accent-success/10 px-2 py-1 rounded shadow-sm">${loadout.budget.toFixed(2)}</div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Tracker Tab */}
          {activeTab === 'tracker' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-dark-text-primary tracking-tight">Resell Tracker</h2>
              {trackers.length === 0 ? (
                <div className="text-dark-text-muted text-center py-12 text-lg">
                  You have no resell trackers yet.
                  <br />
                  <span className="text-base text-dark-text-tertiary">Add trackers from skin pages.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {trackers.map(tracker => {
                    const currentPrice = getCurrentPrice(tracker);
                    const profitLoss = currentPrice ? currentPrice - tracker.buy_price : null;
                    const profitLossPercent = profitLoss && tracker.buy_price ? (profitLoss / tracker.buy_price) * 100 : null;
                    const tradeInfo = getTradeLockInfo(tracker.bought_at);
                    return (
                      <div key={tracker.id} className="glass-card flex flex-col md:flex-row gap-4 p-5 md:p-6 items-center md:items-stretch shadow-dark-lg border border-dark-border-primary/60">
                          {tracker.skin ? (
                          <Link to={`/skins/${tracker.skin.id}`} className="flex-shrink-0 mb-2 md:mb-0 md:mr-6">
                            <img src={tracker.skin.image} alt={tracker.skin.name} className="w-20 h-20 object-contain rounded-xl border border-dark-border-primary/60 shadow" />
                            </Link>
                          ) : (
                          <div className="w-20 h-20 flex items-center justify-center bg-dark-bg-tertiary rounded-xl text-dark-text-muted text-xs mb-2 md:mb-0 md:mr-4">No Image</div>
                          )}
                        <div className="flex-1 w-full flex flex-col justify-between">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                            <div>
                              <div className="font-bold text-lg md:text-xl text-dark-text-primary mb-1 truncate" title={tracker.skin?.name || 'Skin not found'}>
                                {tracker.skin ? tracker.skin.name : 'Skin not found'}
                              </div>
                              <div className="text-sm text-dark-text-tertiary mb-1">Bought: {formatDate(tracker.bought_at)} • Wear: {getWearDisplay(tracker)}</div>
                              {tracker.notes && (
                                <div className="text-sm text-dark-text-muted mb-1 italic">"{tracker.notes}"</div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 min-w-[90px] w-full md:w-auto items-end md:items-start">
                              <button onClick={() => handleEdit(tracker)} className="btn-secondary text-accent-primary border-accent-primary/40 hover:bg-accent-primary/10 text-sm px-4 py-2 rounded-lg font-semibold w-full md:w-auto" title="Edit tracker">Edit</button>
                              <button onClick={() => handleDelete(tracker.id)} disabled={deleting === tracker.id} className="btn-secondary text-accent-error border-accent-error/40 hover:bg-accent-error/10 text-sm px-4 py-2 rounded-lg font-semibold w-full md:w-auto" title="Delete tracker">{deleting === tracker.id ? "Deleting..." : "Delete"}</button>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-6 items-center">
                            <div className="text-sm text-dark-text-tertiary">
                              <span className="font-medium">Buy Price:</span>
                                <span className="font-bold ml-1 text-dark-text-primary">${tracker.buy_price.toFixed(2)}</span>
                              </div>
                              {currentPrice && (
                                <>
                                <div className="text-sm text-dark-text-tertiary">
                                  <span className="font-medium">Current Price:</span>
                                    <span className="font-bold ml-1 text-dark-text-primary">${currentPrice.toFixed(2)}</span>
                                  </div>
                                <div className={`text-sm font-bold ${profitLoss && profitLoss > 0 ? 'text-accent-success' : 'text-accent-error'}`}>{profitLoss && profitLoss > 0 ? '+' : ''}{profitLoss?.toFixed(2)}{profitLossPercent !== null && profitLossPercent !== undefined && (<span className="ml-1">({profitLossPercent.toFixed(1)}%)</span>)}</div>
                                </>
                              )}
                            </div>
                            <div className="text-xs text-dark-text-muted mb-1">Last updated: {formatDateTime(tracker.skin?.last_price_update || tracker.updated_at)}</div>
                            <div className="mt-2">
                            <span className={`text-xs px-2 py-1 rounded-lg inline-block font-semibold ${tradeInfo.isTradeable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{tradeInfo.isTradeable ? '✓ Tradeable' : `🔒 Trade Locked until ${tradeInfo.unlockDateFormatted}`}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {showEditModal && editingTracker && editingTracker.skin && (
        <ResellTrackerModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingTracker(null);
            setErrorMsg("");
            setSuccessMsg("");
          }}
          onSubmit={async (formData) => {
            setSaving(true);
            setErrorMsg("");
            setSuccessMsg("");
            try {
              const price = parseFloat(formData.buy_price);
              const floatValue = formData.wear_value ? parseFloat(formData.wear_value) : null;
              const { error } = await updateTable("resell_tracker", {
                  buy_price: price,
                  wear_value: floatValue,
                  wear: formData.wear,
                  notes: formData.notes.trim() || null,
                  bought_at: formData.bought_at,
                  updated_at: new Date().toISOString(),
                }, {
                  eq: { id: editingTracker.id, user_id: user.id }
                });
              if (error) {
                setErrorMsg(error.message);
              } else {
                setSuccessMsg("Tracker updated successfully!");
                await loadTrackers();
                setShowEditModal(false);
                setEditingTracker(null);
              }
              setSaving(false);
            } catch (e) {
              setErrorMsg("An error occurred. Please try again.");
              setSaving(false);
            }
          }}
          skin={editingTracker.skin}
          initialData={editFormData}
          mode="edit"
          loading={saving}
          errorMsg={errorMsg}
          successMsg={successMsg}
          floatInputFullWidth={true}
        />
      )}
    </div>
  );
} 