import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../store/auth";
import { useFavorites } from "../store/favorites";
import ResellTrackerModal from '../components/ResellTrackerModal';
import SEO, { SEOPresets } from '../components/SEO';
import { useScrollPosition } from '../utils/scrollPosition';

interface WearEntry {
  wear: string;
  price: number;
  enabled: boolean;
}

interface Skin {
  id: string;
  name: string;
  image: string;
  min_float: number;
  max_float: number;
  stattrak: boolean;
  souvenir: boolean;
  rarity_color: string;
  rarity: string;
  wears_extended: WearEntry[];
  crates: any[];
  collections: any[];
}

export default function Weapon() {
  const { weaponName } = useParams();
  const { user } = useAuth();
  const { favoriteSkinIds, addFavorite, removeFavorite, loading: favoritesLoading } = useFavorites();
  const [skins, setSkins] = useState<Skin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResellModal, setShowResellModal] = useState(false);
  const [selectedSkinForResell, setSelectedSkinForResell] = useState<Skin | null>(null);
  const [buyPrice, setBuyPrice] = useState("");
  const [wearValue, setWearValue] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedWear, setSelectedWear] = useState("");
  const [boughtAt, setBoughtAt] = useState("");
  const [showRarityDropdown, setShowRarityDropdown] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showCratesDropdown, setShowCratesDropdown] = useState(false);
  const [showCollectionsDropdown, setShowCollectionsDropdown] = useState(false);

  // Scroll position management
  const { savePosition, restorePosition } = useScrollPosition();

  // Add wear ranges and helper functions
  const wearRanges = {
    FN: { min: 0.00, max: 0.07, label: "Factory New (FN)" },
    MW: { min: 0.07, max: 0.15, label: "Minimal Wear (MW)" },
    FT: { min: 0.15, max: 0.38, label: "Field-Tested (FT)" },
    WW: { min: 0.38, max: 0.45, label: "Well-Worn (WW)" },
    BS: { min: 0.45, max: 1.00, label: "Battle-Scarred (BS)" }
  };

  const getWearFromFloat = (floatValue: number): string | undefined => {
    for (const [wear, range] of Object.entries(wearRanges)) {
      if (floatValue >= range.min && floatValue <= range.max) {
        return wear;
      }
    }
    return undefined;
  };

  const getPriceForWear = (wear: string): number | null => {
    if (!selectedSkinForResell?.wears_extended) return null;
    const wearEntry = selectedSkinForResell.wears_extended.find(w => w.wear === wear && w.enabled);
    return wearEntry?.price || null;
  };

  const handleFloatChange = (value: string) => {
    setWearValue(value);
    if (value) {
      const float = parseFloat(value);
      if (!isNaN(float) && float >= 0 && float <= 1) {
        const detectedWear = getWearFromFloat(float);
        setSelectedWear(detectedWear || ""); // Ensure it's a string
      }
    }
  };

  const handleWearSelect = (wear: string) => {
    setSelectedWear(wear);
    setWearValue(""); // Clear float when wear is manually selected
  };

  // Add filter state
  const [filterTypes, setFilterTypes] = useState<string[]>([]); // e.g. ['stattrak', 'souvenir', 'none']
  const [filterRarities, setFilterRarities] = useState<string[]>([]);
  const [filterCrates, setFilterCrates] = useState<string[]>([]);
  const [filterCollections, setFilterCollections] = useState<string[]>([]);

  // Add sorting state
  const [sortBy, setSortBy] = useState<'rarity' | 'price-low' | 'price-high' | 'rarity-low' | 'rarity-high'>('rarity');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const rarityOptions = [
    'Consumer Grade',
    'Industrial Grade',
    'Mil-Spec',
    'Restricted',
    'Classified',
    'Covert',
    'Extraordinary',
  ];

  // Rarity order for sorting (higher index = higher rarity)
  const rarityOrder = {
    'Consumer Grade': 0,
    'Industrial Grade': 1,
    'Mil-Spec': 2,
    'Restricted': 3,
    'Classified': 4,
    'Covert': 5,
    'Extraordinary': 6,
  };

  // Helper function to get lowest available price for a skin
  const getLowestPrice = (skin: Skin): number => {
    if (!skin.wears_extended) return 0;
    const enabled = skin.wears_extended.filter(w => w.enabled && w.price > 0);
    if (enabled.length === 0) return 0;
    return Math.min(...enabled.map(w => w.price));
  };

  // Helper function to get highest available price for a skin
  const getHighestPrice = (skin: Skin): number => {
    if (!skin.wears_extended) return 0;
    const enabled = skin.wears_extended.filter(w => w.enabled && w.price > 0);
    if (enabled.length === 0) return 0;
    return Math.max(...enabled.map(w => w.price));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: skinsData } = await supabase
        .from("skins")
        .select("id, name, image, min_float, max_float, stattrak, souvenir, rarity_color, rarity, wears_extended, crates, collections")
        .eq("weapon", weaponName);
      setSkins(skinsData || []);
      setLoading(false);
    };
    if (weaponName) fetchData();
  }, [weaponName]);

  // Restore scroll position on mount
  useEffect(() => {
    if (!loading && skins.length > 0) {
      const timer = setTimeout(() => {
        console.log('Attempting to restore scroll position...');
        restorePosition();
      }, 1000); // Even longer delay to ensure content is fully rendered
      
      return () => clearTimeout(timer);
    }
  }, [restorePosition, loading, skins.length]); // Also depend on skins being loaded

  // Save scroll position before unmounting
  useEffect(() => {
    const handleBeforeUnload = () => {
      savePosition();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      savePosition();
    };
  }, [savePosition]);

  // Dropdown close logic for each filter
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const targets = [
        typeDropdownRef.current,
        rarityDropdownRef.current,
        cratesDropdownRef.current,
        collectionsDropdownRef.current,
        sortDropdownRef.current
      ];
      if (targets.every(ref => ref && !ref.contains(e.target as Node))) {
        setShowTypeDropdown(false);
        setShowRarityDropdown(false);
        setShowCratesDropdown(false);
        setShowCollectionsDropdown(false);
        setShowSortDropdown(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowTypeDropdown(false);
        setShowRarityDropdown(false);
        setShowCratesDropdown(false);
        setShowCollectionsDropdown(false);
        setShowSortDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const rarityDropdownRef = useRef<HTMLDivElement>(null);
  const cratesDropdownRef = useRef<HTMLDivElement>(null);
  const collectionsDropdownRef = useRef<HTMLDivElement>(null);

  function getPriceRange(wears_extended: WearEntry[] | null | undefined) {
    if (!wears_extended) return 'No Data';
    const enabled = wears_extended.filter(w => w.enabled && w.price > 0);
    if (enabled.length === 0) return 'No Data';
    const prices = enabled.map(w => w.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `$${min}` : `$${min} - $${max}`;
  }

  function getWearRange(wears_extended: WearEntry[] | null | undefined) {
    if (!wears_extended) return null;
    const enabled = wears_extended.filter(w => w.enabled);
    if (enabled.length === 0) return null;
    const order = ["FN", "MW", "FT", "WW", "BS"];
    const enabledWears = order.filter(wear => enabled.some(w => w.wear === wear));
    if (enabledWears.length === 1) return enabledWears[0];
    return `${enabledWears[0]} - ${enabledWears[enabledWears.length - 1]}`;
  }

  const handleToggleFavorite = async (e: React.MouseEvent, skinId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    
    const isFavorited = favoriteSkinIds.includes(skinId);
    if (isFavorited) {
      await removeFavorite(user.id, skinId);
    } else {
      await addFavorite(user.id, skinId);
    }
  };

  const handleTrackResell = (e: React.MouseEvent, skin: Skin) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    setSelectedSkinForResell(skin);
    setShowResellModal(true);
  };

  const handleResellSubmit = async () => {
    if (!user || !selectedSkinForResell) return;
    
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      const price = parseFloat(buyPrice);
      let floatValue = wearValue ? parseFloat(wearValue) : null;
      let wearToSave = selectedWear;
      if (wearValue) {
        const floatValueNum = parseFloat(wearValue);
        if (isNaN(floatValueNum)) {
          setErrorMsg("Please enter a valid float value.");
          setSaving(false);
          return;
        }
        const detectedWear = getWearFromFloat(floatValueNum);
        if (!detectedWear) {
          setErrorMsg("This float is not possible for this skin.");
          setSaving(false);
          return;
        }
        const enabled = selectedSkinForResell.wears_extended?.find(w => w.wear === detectedWear && w.enabled);
        if (!enabled) {
          setErrorMsg("This float is not possible for this skin.");
          setSaving(false);
          return;
        }
        wearToSave = detectedWear;
      }
      if (!wearToSave) {
        setErrorMsg("Please select a wear or enter a float value.");
        setSaving(false);
        return;
      }
      if (!boughtAt) {
        setErrorMsg("Please select the date you bought this skin.");
        setSaving(false);
        return;
      }
      if (!buyPrice || isNaN(price)) {
        setErrorMsg("Please enter a valid buy price.");
        setSaving(false);
        return;
      }
      const { error } = await supabase
        .from("resell_tracker")
        .insert([
          {
            user_id: user.id,
            skin_id: selectedSkinForResell.id,
            buy_price: price,
            wear_value: floatValue,
            wear: wearToSave,
            notes: notes.trim() || null,
            bought_at: boughtAt,
          },
        ]);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("Resell tracker added!");
        setBuyPrice("");
        setWearValue("");
        setNotes("");
        setSelectedWear("");
        setBoughtAt("");
        setShowResellModal(false);
        setSelectedSkinForResell(null);
      }
      setSaving(false);
    } catch (error) {
      setErrorMsg("An error occurred. Please try again.");
      setSaving(false);
    }
  };

  // Filtered and sorted skins
  const filteredSkins = skins.filter(skin => {
    // Type filter
    if (filterTypes.length > 0) {
      let matchesType = false;
      if (filterTypes.includes('stattrak') && skin.stattrak) matchesType = true;
      if (filterTypes.includes('souvenir') && skin.souvenir) matchesType = true;
      if (filterTypes.includes('none') && !skin.stattrak && !skin.souvenir) matchesType = true;
      if (!matchesType) return false;
    }
    // Rarity filter
    if (filterRarities.length > 0 && !filterRarities.includes(skin.rarity)) return false;
    // Crate filter
    if (filterCrates.length > 0) {
      const skinCrateNames = skin.crates?.map((crate: any) => crate.name) || [];
      const hasMatchingCrate = filterCrates.some(crateName => 
        skinCrateNames.includes(crateName)
      );
      if (!hasMatchingCrate) return false;
    }
    // Collection filter
    if (filterCollections.length > 0) {
      const skinCollectionNames = skin.collections?.map((collection: any) => collection.name) || [];
      const hasMatchingCollection = filterCollections.some(collectionName => 
        skinCollectionNames.includes(collectionName)
      );
      if (!hasMatchingCollection) return false;
    }
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rarity':
        // Sort by rarity (highest first - default)
        return (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) - (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0);
      case 'rarity-low':
        // Sort by rarity (lowest first)
        return (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0) - (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0);
      case 'rarity-high':
        // Sort by rarity (highest first)
        return (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) - (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0);
      case 'price-low':
        // Sort by lowest available price (lowest first)
        return getLowestPrice(a) - getLowestPrice(b);
      case 'price-high':
        // Sort by highest available price (highest first)
        return getHighestPrice(b) - getHighestPrice(a);
      default:
        return 0;
    }
  });

  return (
    <>
      {weaponName && <SEO {...SEOPresets.weapon(weaponName)} />}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-dark-text-primary mb-4 tracking-tight text-gradient drop-shadow-lg">
            {weaponName} Skins
          </h1>
          <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto font-medium">
            Discover the best {weaponName} skins for CS 2. Browse by rarity, wear, and price to find your perfect skin.
          </p>
        </div>

        {/* Filter UI */}
        <div className="mb-6 flex flex-wrap gap-4">
          {/* Sort Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              type="button"
              className="w-48 bg-dark-bg-secondary border border-dark-border rounded px-3 py-2 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-accent-primary"
              onClick={() => {
                setShowSortDropdown(v => !v);
                setShowTypeDropdown(false);
                setShowRarityDropdown(false);
                setShowCratesDropdown(false);
                setShowCollectionsDropdown(false);
              }}
              aria-haspopup="true"
              aria-expanded={showSortDropdown}
            >
              <span>
                {sortBy === 'rarity' && 'Sort by Rarity'}
                {sortBy === 'rarity-low' && 'Lowest Rarity'}
                {sortBy === 'rarity-high' && 'Highest Rarity'}
                {sortBy === 'price-low' && 'Lowest Price'}
                {sortBy === 'price-high' && 'Highest Price'}
              </span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showSortDropdown && (
              <div className="absolute z-10 mt-1 w-64 bg-dark-bg-secondary border border-dark-border rounded shadow-lg max-h-60 overflow-auto p-2 flex flex-col">
                <button
                  type="button"
                  className={`text-left px-4 py-2 rounded font-medium transition-all mb-1 ${sortBy === 'rarity' ? 'bg-accent-primary text-white' : 'hover:bg-accent-primary/10 text-dark-text-primary'}`}
                  onClick={() => {
                    setSortBy('rarity');
                    setShowSortDropdown(false);
                  }}
                >
                  Sort by Rarity
                </button>
                <button
                  type="button"
                  className={`text-left px-4 py-2 rounded font-medium transition-all mb-1 ${sortBy === 'rarity-low' ? 'bg-accent-primary text-white' : 'hover:bg-accent-primary/10 text-dark-text-primary'}`}
                  onClick={() => {
                    setSortBy('rarity-low');
                    setShowSortDropdown(false);
                  }}
                >
                  Lowest Rarity
                </button>
                <button
                  type="button"
                  className={`text-left px-4 py-2 rounded font-medium transition-all mb-1 ${sortBy === 'rarity-high' ? 'bg-accent-primary text-white' : 'hover:bg-accent-primary/10 text-dark-text-primary'}`}
                  onClick={() => {
                    setSortBy('rarity-high');
                    setShowSortDropdown(false);
                  }}
                >
                  Highest Rarity
                </button>
                <button
                  type="button"
                  className={`text-left px-4 py-2 rounded font-medium transition-all mb-1 ${sortBy === 'price-low' ? 'bg-accent-primary text-white' : 'hover:bg-accent-primary/10 text-dark-text-primary'}`}
                  onClick={() => {
                    setSortBy('price-low');
                    setShowSortDropdown(false);
                  }}
                >
                  Lowest Price
                </button>
                <button
                  type="button"
                  className={`text-left px-4 py-2 rounded font-medium transition-all mb-1 ${sortBy === 'price-high' ? 'bg-accent-primary text-white' : 'hover:bg-accent-primary/10 text-dark-text-primary'}`}
                  onClick={() => {
                    setSortBy('price-high');
                    setShowSortDropdown(false);
                  }}
                >
                  Highest Price
                </button>
              </div>
            )}
          </div>
          {/* Type Dropdown */}
          <div className="relative" ref={typeDropdownRef}>
            <button
              type="button"
              className="w-48 bg-dark-bg-secondary border border-dark-border rounded px-3 py-2 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-accent-primary"
              onClick={() => {
                setShowTypeDropdown(v => !v);
                setShowRarityDropdown(false);
                setShowCratesDropdown(false);
                setShowCollectionsDropdown(false);
              }}
              aria-haspopup="true"
              aria-expanded={showTypeDropdown}
            >
              <span>{filterTypes.length === 0 ? 'All Types' : filterTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showTypeDropdown && (
              <div className="absolute z-10 mt-1 w-64 bg-dark-bg-secondary border border-dark-border rounded shadow-lg max-h-60 overflow-auto p-3 flex gap-2 flex-wrap">
                {['stattrak', 'souvenir', 'none'].map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`px-4 py-2 rounded-full font-semibold transition-all border-2 ${filterTypes.includes(type) ? 'bg-accent-primary text-white border-accent-primary' : 'bg-dark-bg-primary text-dark-text-primary border-dark-border hover:bg-accent-primary/10'}`}
                    onClick={() => {
                      setFilterTypes(types =>
                        types.includes(type)
                          ? types.filter(val => val !== type)
                          : [...types, type]
                      );
                    }}
                  >
                    {type === 'none' ? 'None' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Rarity Dropdown */}
          <div className="relative" ref={rarityDropdownRef}>
            <button
              type="button"
              className="w-64 bg-dark-bg-secondary border border-dark-border rounded px-3 py-2 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-accent-primary"
              onClick={() => {
                setShowRarityDropdown(v => !v);
                setShowTypeDropdown(false);
                setShowCratesDropdown(false);
                setShowCollectionsDropdown(false);
              }}
              aria-haspopup="true"
              aria-expanded={showRarityDropdown}
            >
              <span>{filterRarities.length === 0 ? 'All Rarities' : filterRarities.join(', ')}</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showRarityDropdown && (
              <div className="absolute z-10 mt-1 w-64 bg-dark-bg-secondary border border-dark-border rounded shadow-lg max-h-72 overflow-auto p-2 flex flex-col">
                {rarityOptions.map(rarity => (
                  <button
                    key={rarity}
                    type="button"
                    className={`text-left px-4 py-2 rounded font-medium transition-all mb-1 ${filterRarities.includes(rarity) ? 'bg-accent-primary text-white' : 'hover:bg-accent-primary/10 text-dark-text-primary'}`}
                    onClick={() => {
                      setFilterRarities(r =>
                        r.includes(rarity)
                          ? r.filter(val => val !== rarity)
                          : [...r, rarity]
                      );
                    }}
                  >
                    {rarity}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Crates Dropdown */}
          <div className="relative" ref={cratesDropdownRef}>
            <button
              type="button"
              className="w-64 bg-dark-bg-secondary border border-dark-border rounded px-3 py-2 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-accent-primary"
              onClick={() => {
                setShowCratesDropdown(v => !v);
                setShowTypeDropdown(false);
                setShowRarityDropdown(false);
                setShowCollectionsDropdown(false);
              }}
              aria-haspopup="true"
              aria-expanded={showCratesDropdown}
            >
              <span>{filterCrates.length === 0 ? 'All Crates' : filterCrates.join(', ')}</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showCratesDropdown && (
              <div className="absolute z-10 mt-1 w-64 bg-dark-bg-secondary border border-dark-border rounded shadow-lg max-h-72 overflow-auto p-2 flex flex-col">
                {Array.from(new Set(skins.flatMap(skin => skin.crates?.map((crate: any) => crate.name) || []))).sort().map(crateName => (
                  <button
                    key={crateName}
                    type="button"
                    className={`text-left px-4 py-2 rounded font-medium transition-all mb-1 ${filterCrates.includes(crateName) ? 'bg-accent-primary text-white' : 'hover:bg-accent-primary/10 text-dark-text-primary'}`}
                    onClick={() => {
                      setFilterCrates(c =>
                        c.includes(crateName)
                          ? c.filter(val => val !== crateName)
                          : [...c, crateName]
                      );
                    }}
                  >
                    {crateName}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Collections Dropdown */}
          <div className="relative" ref={collectionsDropdownRef}>
            <button
              type="button"
              className="w-64 bg-dark-bg-secondary border border-dark-border rounded px-3 py-2 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-accent-primary"
              onClick={() => {
                setShowCollectionsDropdown(v => !v);
                setShowTypeDropdown(false);
                setShowRarityDropdown(false);
                setShowCratesDropdown(false);
              }}
              aria-haspopup="true"
              aria-expanded={showCollectionsDropdown}
            >
              <span>{filterCollections.length === 0 ? 'All Collections' : filterCollections.join(', ')}</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showCollectionsDropdown && (
              <div className="absolute z-10 mt-1 w-64 bg-dark-bg-secondary border border-dark-border rounded shadow-lg max-h-72 overflow-auto p-2 flex flex-col">
                {Array.from(new Set(skins.flatMap(skin => skin.collections?.map((collection: any) => collection.name) || []))).sort().map(collectionName => (
                  <button
                    key={collectionName}
                    type="button"
                    className={`text-left px-4 py-2 rounded font-medium transition-all mb-1 ${filterCollections.includes(collectionName) ? 'bg-accent-primary text-white' : 'hover:bg-accent-primary/10 text-dark-text-primary'}`}
                    onClick={() => {
                      setFilterCollections(c =>
                        c.includes(collectionName)
                          ? c.filter(val => val !== collectionName)
                          : [...c, collectionName]
                      );
                    }}
                  >
                    {collectionName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Skins grid */}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredSkins.map(skin => {
              const isFavorited = favoriteSkinIds.includes(skin.id);
              return (
                <div key={skin.id} className="relative h-full">
                  <Link 
                    to={`/skins/${skin.id}`} 
                    className="block w-full h-full"
                    onClick={(e) => {
                      // Save current scroll position before navigating to detail
                      e.preventDefault();
                      savePosition();
                      // Navigate after saving position
                      window.location.href = `/skins/${skin.id}`;
                    }}
                  >
                    <div className="glass-card flex flex-col items-center justify-between h-full min-h-[340px] rounded-2xl p-6 shadow-dark-lg border border-dark-border-primary/60 group hover:scale-105 hover:shadow-dark-lg transition-all duration-200">
                      <div className="flex w-full justify-between items-center mb-2">
                        <div className="flex-1"></div>
                        <button
                          onClick={e => { handleToggleFavorite(e, skin.id); }}
                          disabled={favoritesLoading}
                          className={`glass-card !p-0 !m-0 flex items-center justify-center w-11 h-11 rounded-full border border-dark-border-primary/40 shadow transition-all duration-200 absolute top-4 right-4 z-10 ${isFavorited ? 'bg-accent-error/20' : 'bg-dark-bg-tertiary/60 hover:bg-accent-error/10'} group/fav-heart`}
                          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                          style={{ boxShadow: isFavorited ? '0 0 8px 2px rgba(255,0,80,0.18)' : undefined }}
                          tabIndex={0}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill={isFavorited ? '#ff3366' : 'none'}
                            stroke="#ff3366"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-7 h-7 transition-all duration-200 group-hover/fav-heart:scale-110 group-hover/fav-heart:drop-shadow-[0_0_8px_rgba(255,51,102,0.5)] group-focus/fav-heart:scale-110 group-focus/fav-heart:drop-shadow-[0_0_8px_rgba(255,51,102,0.5)]"
                          >
                            <path d="M12 21s-6.2-5.2-8.2-7.2A5.5 5.5 0 0 1 12 5.5a5.5 5.5 0 0 1 8.2 8.3C18.2 15.8 12 21 12 21z" />
                          </svg>
                        </button>
                      </div>
                      <img src={skin.image} alt={skin.name} className="w-32 h-32 object-contain mb-2 rounded-xl border border-dark-border-primary/60" />
                      <button
                        onClick={e => { handleTrackResell(e, skin); }}
                        className="mt-2 mb-3 px-5 py-2 rounded-full glass-card border border-accent-primary/40 text-accent-primary font-semibold flex items-center gap-2 shadow hover:bg-accent-primary/10 transition-all group/track-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 hover:scale-105 hover:drop-shadow-[0_0_10px_rgba(128,0,255,0.18)] focus:scale-105 focus:drop-shadow-[0_0_10px_rgba(128,0,255,0.18)]"
                        title="Track Resell"
                        tabIndex={0}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Track</span>
                      </button>
                      <div className="font-bold mb-1 text-dark-text-primary text-center text-lg">{skin.name}</div>
                      <div className="text-sm text-dark-text-muted mb-1 text-center">Available: {getWearRange(skin.wears_extended) || "-"}</div>
                      <div className="text-lg font-bold mb-1 text-accent-success bg-accent-success/10 px-2 py-1 rounded shadow-sm text-center">Price: {getPriceRange(skin.wears_extended) || "-"}</div>
                      <div className="w-4 h-4 rounded-full mt-1 border border-dark-border-primary/60" style={{ background: skin.rarity_color }} title="Rarity"></div>
                    </div>
                  </Link>
                </div>
              );
            })}
            {filteredSkins.length === 0 && <div className="col-span-3 text-dark-text-muted">No skins for this weapon.</div>}
          </div>
        )}

        {/* Resell Tracker Modal */}
        {showResellModal && selectedSkinForResell && (
          <ResellTrackerModal
            open={showResellModal}
            onClose={() => {
              setShowResellModal(false);
              setSelectedSkinForResell(null);
              setBuyPrice("");
              setWearValue("");
              setNotes("");
              setSelectedWear("");
              setBoughtAt("");
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
                const { error } = await supabase
                  .from("resell_tracker")
                  .insert([
                    {
                      user_id: user.id,
                      skin_id: selectedSkinForResell.id,
                      buy_price: price,
                      wear_value: floatValue,
                      wear: formData.wear,
                      notes: formData.notes.trim() || null,
                      bought_at: formData.bought_at,
                    },
                  ]);
                if (error) {
                  setErrorMsg(error.message);
                } else {
                  setSuccessMsg("Resell tracker added!");
                  setBuyPrice("");
                  setWearValue("");
                  setNotes("");
                  setSelectedWear("");
                  setBoughtAt("");
                  setShowResellModal(false);
                  setSelectedSkinForResell(null);
                }
                setSaving(false);
              } catch (e) {
                setErrorMsg("An error occurred. Please try again.");
                setSaving(false);
              }
            }}
            skin={selectedSkinForResell}
            initialData={{
              buy_price: buyPrice,
              wear_value: wearValue,
              wear: selectedWear,
              notes: notes,
              bought_at: boughtAt,
            }}
            mode="add"
            loading={saving}
            errorMsg={errorMsg}
            successMsg={successMsg}
            floatInputFullWidth={true}
          />
        )}
      </div>
    </>
  );
} 