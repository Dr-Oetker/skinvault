import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../store/auth";
import LoadingSkeleton from '../components/LoadingSkeleton';
import { getSideImage, getWeaponImage } from '../utils/images';
import { selectFrom, updateTable } from '../utils/supabaseApi';

// Weapon definitions (reuse from LoadoutDetail)
const weaponDefinitions = {
  tec9_tside: { name: 'Tec-9', side: 't' as const },
  galil_tside: { name: 'Galil AR', side: 't' as const },
  ak47_tside: { name: 'AK-47', side: 't' as const },
  mac10_tside: { name: 'MAC-10', side: 't' as const },
  sawed_off_tside: { name: 'Sawed-Off', side: 't' as const },
  glock18_tside: { name: 'Glock-18', side: 't' as const },
  g3sg1_tside: { name: 'G3SG1', side: 't' as const },
  sg553_tside: { name: 'SG 553', side: 't' as const },
  mp9_ctside: { name: 'MP9', side: 'ct' as const },
  aug_ctside: { name: 'AUG', side: 'ct' as const },
  famas_ctside: { name: 'FAMAS', side: 'ct' as const },
  m4a4_ctside: { name: 'M4A4', side: 'ct' as const },
  m4a1s_ctside: { name: 'M4A1-S', side: 'ct' as const },
  p2000_ctside: { name: 'P2000', side: 'ct' as const },
  fiveseven_ctside: { name: 'Five-SeveN', side: 'ct' as const },
  scar20_ctside: { name: 'SCAR-20', side: 'ct' as const },
  usps_ctside: { name: 'USP-S', side: 'ct' as const },
  mag7_ctside: { name: 'MAG-7', side: 'ct' as const },
  r8_revolver_tside: { name: 'R8 Revolver', side: 't' as const },
  r8_revolver_ctside: { name: 'R8 Revolver', side: 'ct' as const },
  pp_bizon_tside: { name: 'PP-Bizon', side: 't' as const },
  pp_bizon_ctside: { name: 'PP-Bizon', side: 'ct' as const },
  p250_tside: { name: 'P250', side: 't' as const },
  p250_ctside: { name: 'P250', side: 'ct' as const },
  nova_tside: { name: 'Nova', side: 't' as const },
  nova_ctside: { name: 'Nova', side: 'ct' as const },
  desert_eagle_tside: { name: 'Desert Eagle', side: 't' as const },
  desert_eagle_ctside: { name: 'Desert Eagle', side: 'ct' as const },
  xm1014_tside: { name: 'XM1014', side: 't' as const },
  xm1014_ctside: { name: 'XM1014', side: 'ct' as const },
  mp7_tside: { name: 'MP7', side: 't' as const },
  mp7_ctside: { name: 'MP7', side: 'ct' as const },
  mp5sd_tside: { name: 'MP5-SD', side: 't' as const },
  mp5sd_ctside: { name: 'MP5-SD', side: 'ct' as const },
  awp_tside: { name: 'AWP', side: 't' as const },
  awp_ctside: { name: 'AWP', side: 'ct' as const },
  negev_tside: { name: 'Negev', side: 't' as const },
  negev_ctside: { name: 'Negev', side: 'ct' as const },
  ssg08_tside: { name: 'SSG 08', side: 't' as const },
  ssg08_ctside: { name: 'SSG 08', side: 'ct' as const },
  m249_tside: { name: 'M249', side: 't' as const },
  m249_ctside: { name: 'M249', side: 'ct' as const },
  p90_tside: { name: 'P90', side: 't' as const },
  p90_ctside: { name: 'P90', side: 'ct' as const },
  cz75auto_tside: { name: 'CZ75-Auto', side: 't' as const },
  cz75auto_ctside: { name: 'CZ75-Auto', side: 'ct' as const },
  dual_berettas_tside: { name: 'Dual Berettas', side: 't' as const },
  dual_berettas_ctside: { name: 'Dual Berettas', side: 'ct' as const },
  ump45_tside: { name: 'UMP-45', side: 't' as const },
  ump45_ctside: { name: 'UMP-45', side: 'ct' as const },
  knives_tside: { name: 'Knives', side: 't' as const },
  knives_ctside: { name: 'Knives', side: 'ct' as const },
  gloves_tside: { name: 'Gloves', side: 't' as const },
  gloves_ctside: { name: 'Gloves', side: 'ct' as const },
};

// Weapon category mapping for sorting and grouping
const weaponCategoryMap: Record<string, string> = {
  // Pistols
  'Glock-18': 'Pistols',
  'USP-S': 'Pistols',
  'P2000': 'Pistols',
  'P250': 'Pistols',
  'Five-SeveN': 'Pistols',
  'Tec-9': 'Pistols',
  'CZ75-Auto': 'Pistols',
  'Dual Berettas': 'Pistols',
  'Desert Eagle': 'Pistols',
  'R8 Revolver': 'Pistols',
  // SMGs
  'MAC-10': 'SMGs',
  'MP9': 'SMGs',
  'MP7': 'SMGs',
  'MP5-SD': 'SMGs',
  'UMP-45': 'SMGs',
  'P90': 'SMGs',
  'PP-Bizon': 'SMGs',
  // Heavy
  'Nova': 'Heavy',
  'XM1014': 'Heavy',
  'MAG-7': 'Heavy',
  'M249': 'Heavy',
  'Negev': 'Heavy',
  'Sawed-Off': 'Heavy',
  // Rifles
  'AK-47': 'Rifles',
  'Galil AR': 'Rifles',
  'FAMAS': 'Rifles',
  'M4A4': 'Rifles',
  'M4A1-S': 'Rifles',
  'AUG': 'Rifles',
  'SG 553': 'Rifles',
  'G3SG1': 'Rifles',
  'SCAR-20': 'Rifles',
  'SSG 08': 'Rifles',
  'AWP': 'Rifles',
};

interface SelectedSkinInfo {
  id: string;
  name: string;
  image: string;
  wear?: string;
  price?: number;
}

interface Skin {
  id: string;
  name: string;
  image: string;
  wears_extended: any[];
  rarity_color: string;
}

interface WearEntry {
  wear: string;
  price: number;
  enabled: boolean;
  variant: 'normal' | 'stattrak' | 'souvenir';
}

type Side = 't' | 'ct';

export default function EditLoadout() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [activeSide, setActiveSide] = useState<Side>('t');
  const [selectedSkinsInfo, setSelectedSkinsInfo] = useState<Record<string, SelectedSkinInfo>>({});
  const [skins, setSkins] = useState<Skin[]>([]);
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>("");
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
  const [showWearSelection, setShowWearSelection] = useState(false);
  const [showWeaponTypeModal, setShowWeaponTypeModal] = useState<null | 'knives' | 'gloves'>(null);
  const [weaponTypeOptions, setWeaponTypeOptions] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  // Add state for image modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalUrl, setImageModalUrl] = useState<string|null>(null);
  const [skinModalScrollY, setSkinModalScrollY] = useState<number | null>(null);
  const [wearModalScrollY, setWearModalScrollY] = useState<number | null>(null);
  const [typeModalScrollY, setTypeModalScrollY] = useState<number | null>(null);
  const [imageModalScrollY, setImageModalScrollY] = useState<number | null>(null);

  // Body scroll lock effects
  useEffect(() => {
    if (skins.length > 0 || showWearSelection || showWeaponTypeModal || showImageModal) {
      // Prevent scrolling immediately
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
      
      return () => {
        document.body.style.overflow = originalStyle;
        document.body.style.position = '';
        document.body.style.width = '';
        const scrollY = document.body.style.top;
        document.body.style.top = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      };
    } else {
      // Restore scrolling
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    }
  }, [skins.length, showWearSelection, showWeaponTypeModal, showImageModal]);

  useEffect(() => {
    const fetchLoadout = async () => {
      setLoading(true);
      
      // Fetch basic loadout data
      const { data: loadoutData, error: loadoutError } = await selectFrom("user_loadouts", {
        eq: { id },
        single: true
      });
      
      if (loadoutError || !loadoutData) {
        setError("Loadout not found or you do not have permission to edit.");
        setLoading(false);
        return;
      }
      
      if (!user || loadoutData.user_id !== user.id) {
        setError("You do not have permission to edit this loadout.");
        setLoading(false);
        return;
      }
      
      setTitle(loadoutData.title || "");
      setDescription(loadoutData.description || "");
      setBudget(loadoutData.budget ? String(loadoutData.budget) : "");
      
      // Convert loadout data to selected skins info
      const skinInfo: Record<string, SelectedSkinInfo> = {};
      
      // Process all weapon fields in the loadout
      for (const [weaponKey, skinId] of Object.entries(loadoutData)) {
        if (skinId && weaponKey !== 'id' && weaponKey !== 'title' && weaponKey !== 'description' && 
            weaponKey !== 'budget' && weaponKey !== 'user_id' && weaponKey !== 'created_at' && 
            weaponKey !== 'updated_at' && !weaponKey.endsWith('_wear')) {
          
          // Skip if skinId is not a valid UUID
          if (typeof skinId !== 'string' || skinId.length < 10) {
            continue;
          }
          
          try {
            // Get wear information from the database
            const wearField = `${weaponKey}_wear`;
            const selectedWear = loadoutData[wearField as keyof typeof loadoutData] as string | undefined;
            
            const { data: skin } = await selectFrom('skins', {
              select: 'id, name, image, wears_extended',
              eq: { id: skinId },
              single: true
            });
            
            if (skin) {
              // Find the wear entry for the selected wear
              let wear = null;
              let price = 0;
              if (selectedWear && skin.wears_extended) {
                const wearEntry = skin.wears_extended.find((w: any) => 
                  w.wear === selectedWear && w.enabled
                );
                if (wearEntry) {
                  wear = wearEntry.wear;
                  price = wearEntry.price;
                }
              }
              
              skinInfo[weaponKey] = {
                id: skin.id,
                name: skin.name,
                image: skin.image,
                wear: wear,
                price: price
              };
            }
          } catch (error) {
            console.error(`Error fetching skin for ${weaponKey}:`, error);
          }
        }
      }
      
      setSelectedSkinsInfo(skinInfo);
      setLoading(false);
    };
    if (id) fetchLoadout();
  }, [id, user]);

  useEffect(() => {
    calculateTotalCost();
  }, [selectedSkinsInfo]);

  useEffect(() => {
    const modalOpen = skins.length > 0 || showWearSelection || showWeaponTypeModal || showImageModal;
    if (modalOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = scrollbarWidth + 'px';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [skins.length, showWearSelection, showWeaponTypeModal, showImageModal]);

  useEffect(() => {
    if (skins.length > 0) {
      setSkinModalScrollY(window.scrollY);
    }
    if (showWearSelection) {
      setWearModalScrollY(window.scrollY);
    }
    if (showWeaponTypeModal) {
      setTypeModalScrollY(window.scrollY);
    }
    if (showImageModal) {
      setImageModalScrollY(window.scrollY);
    }
  }, [skins.length, showWearSelection, showWeaponTypeModal, showImageModal]);

  const calculateTotalCost = async () => {
    let total = 0;
    for (const skinInfo of Object.values(selectedSkinsInfo)) {
      if (skinInfo.price) {
        total += skinInfo.price;
      }
    }
    setTotalCost(total);
  };

  const handleSideChange = (side: Side) => {
    setActiveSide(side);
  };

  const getWeaponsForSide = (side: Side) => {
    const weapons = [];
    
    for (const [weaponKey, weaponDef] of Object.entries(weaponDefinitions)) {
      if (weaponDef.side === side && !weaponKey.startsWith('knives') && !weaponKey.startsWith('gloves')) {
        weapons.push({
          key: weaponKey,
          name: weaponDef.name,
          side: weaponDef.side
        });
      }
    }
    
    return weapons;
  };

  const fetchWeaponTypeOptions = async (category: 'Knives' | 'Gloves') => {
    const { data: weaponsData, error } = await selectFrom('weapons', {
      select: 'id, name, category',
      eq: { category },
      order: { column: 'name' }
    });
    if (error) {
      setWeaponTypeOptions([]);
    } else {
      setWeaponTypeOptions(weaponsData || []);
    }
  };

  const handleWeaponSelect = async (weaponKey: string) => {
    setSelectedWeaponId(weaponKey);
    if (weaponKey.startsWith('knives') || weaponKey.startsWith('gloves')) {
      // Step 1: Show weapon type modal
      const category = weaponKey.startsWith('knives') ? 'knives' : 'gloves';
      setShowWeaponTypeModal(category);
      await fetchWeaponTypeOptions(category === 'knives' ? 'Knives' : 'Gloves');
      return;
    }
    // Step 2: For normal weapons, show skin selection
    const weaponDef = weaponDefinitions[weaponKey as keyof typeof weaponDefinitions];
    if (!weaponDef) return;
    const { data: skinsData, error } = await selectFrom('skins', {
      select: 'id, name, image, wears_extended, rarity_color',
      eq: { weapon: weaponDef.name },
      order: { column: 'name' }
    });
    if (error) {
      setSkins([]);
    } else if (skinsData) {
      setSkins(skinsData);
    }
  };

  const handleWeaponTypePick = async (weaponTypeName: string) => {
    setShowWeaponTypeModal(null);
    setSelectedWeaponId(selectedWeaponId); // keep slot
    // Fetch skins for the selected weapon type
    const { data: skinsData, error } = await selectFrom('skins', {
      select: 'id, name, image, wears_extended, rarity_color',
      eq: { weapon: weaponTypeName },
      order: { column: 'name' }
    });
    if (error) {
      setSkins([]);
    } else if (skinsData) {
      setSkins(skinsData);
    }
  };

  const handleSkinSelect = async (weaponId: string, skinId: string) => {
    console.log('handleSkinSelect called with:', { weaponId, skinId });
    
    // Set the selected skin and show wear selection
    const skin = skins.find(s => s.id === skinId);
    if (skin) {
      console.log('Selected skin:', skin);
      setSelectedSkin(skin);
      setShowWearSelection(true);
    }
  };

  const handleWearSelect = async (wearName: string) => {
    if (!selectedSkin || !selectedWeaponId) return;

    const wearEntry = selectedSkin.wears_extended.find(w => w.wear === wearName);
    const price = wearEntry?.price || 0;

    setSelectedSkinsInfo(prev => ({
      ...prev,
      [selectedWeaponId]: {
        id: selectedSkin.id,
        name: selectedSkin.name,
        image: selectedSkin.image,
        wear: wearName,
        price: price
      }
    }));

    setShowWearSelection(false);
    setSelectedSkin(null);
    setSkins([]);
    setSelectedWeaponId("");
  };

  const handleDeselectSkin = async (weaponKey: string) => {
    setSelectedSkinsInfo(prev => {
      const newInfo = { ...prev };
      delete newInfo[weaponKey];
      return newInfo;
    });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Build update data for user_loadouts table
      const updateData: any = {
        title: title.trim(),
        description: description.trim(),
        budget: budget ? parseFloat(budget) : null,
        updated_at: new Date().toISOString()
      };

      // Add all selected skins to the update data
      for (const [weaponKey, skinInfo] of Object.entries(selectedSkinsInfo)) {
        updateData[weaponKey] = skinInfo.id;
        updateData[`${weaponKey}_wear`] = skinInfo.wear;
      }

      // Clear any unselected weapons
      for (const weaponKey of Object.keys(weaponDefinitions)) {
        if (!selectedSkinsInfo[weaponKey]) {
          updateData[weaponKey] = null;
          updateData[`${weaponKey}_wear`] = null;
        }
      }

      // Update the loadout using REST API
      const { error: loadoutError } = await updateTable("user_loadouts", updateData, {
        eq: { id }
      });

      if (loadoutError) {
        throw loadoutError;
      }

      // Navigate back to the loadout detail page
      navigate(`/loadouts/user/${id}`);
    } catch (err: any) {
      if (err.message?.includes('timed out')) {
        setError("Save operation timed out. Please check your connection and try again.");
      } else {
        setError(err.message || "Failed to save loadout");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto py-8 px-2 sm:px-6">
      <div className="glass-card p-6 md:p-8 shadow-dark-lg border border-dark-border-primary/60 mb-8">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent tracking-tight mb-2">Edit Loadout</h1>
        <LoadingSkeleton type="skeleton" lines={10} />
      </div>
    </div>
  );
  if (error) return (
    <div className="max-w-5xl mx-auto py-8 px-2 sm:px-6">
      <div className="glass-card p-6 md:p-8 shadow-dark-lg border border-dark-border-primary/60 mb-8">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent tracking-tight mb-2">Edit Loadout</h1>
        <div className="py-16 text-accent-error text-lg text-center">{error}</div>
        <button onClick={() => navigate('/loadouts')} className="btn-secondary mt-6">Back to Loadouts</button>
      </div>
    </div>
  );

  const weaponsForSide = getWeaponsForSide(activeSide);

  // Group weapons by category
  const groupedWeapons: Record<string, typeof weaponsForSide> = {
    Pistols: [],
    'SMGs & Heavy': [],
    Rifles: [],
  };
  weaponsForSide.forEach(weapon => {
    const cat = weaponCategoryMap[weapon.name];
    if (cat === 'Pistols') groupedWeapons.Pistols.push(weapon);
    else if (cat === 'SMGs' || cat === 'Heavy') groupedWeapons['SMGs & Heavy'].push(weapon);
    else if (cat === 'Rifles') groupedWeapons.Rifles.push(weapon);
  });

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-8 px-2 sm:px-4 lg:px-6 overflow-x-hidden">
      <div className="glass-card p-4 sm:p-6 md:p-8 shadow-dark-lg border border-dark-border-primary/60 mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent tracking-tight mb-2 md:mb-0">Edit Loadout</h1>
          <div className="flex gap-2 sm:gap-3 flex-wrap justify-start md:justify-end">
            <button onClick={() => navigate(`/loadouts/user/${id}`)} className="btn-secondary px-3 sm:px-5 py-2 rounded-xl font-semibold text-sm sm:text-base">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary px-3 sm:px-5 py-2 rounded-xl font-semibold text-sm sm:text-base">{saving ? 'Saving...' : 'Save Loadout'}</button>
          </div>
        </div>
        {/* Form Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div>
            <label className="block text-sm sm:text-base font-semibold text-dark-text-primary mb-2">Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input-dark w-full" placeholder="Enter loadout title" />
          </div>
          <div>
            <label className="block text-sm sm:text-base font-semibold text-dark-text-primary mb-2">Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="input-dark w-full" placeholder="Enter description" />
          </div>
          <div>
            <label className="block text-sm sm:text-base font-semibold text-dark-text-primary mb-2">Budget</label>
            <input type="number" value={budget} onChange={e => setBudget(e.target.value)} className="input-dark w-full" placeholder="Enter budget" step="0.01" />
          </div>
        </div>
        {/* Cost Bar and Tabs */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button onClick={() => setActiveSide('t')} className={`px-6 py-2 rounded-xl font-bold text-base transition-all ${activeSide === 't' ? 'bg-accent-primary text-white shadow' : 'bg-dark-bg-tertiary text-dark-text-primary border border-dark-border-primary/40 hover:bg-accent-primary/10'}`}>T-Side</button>
            <button onClick={() => setActiveSide('ct')} className={`px-6 py-2 rounded-xl font-bold text-base transition-all ${activeSide === 'ct' ? 'bg-accent-primary text-white shadow' : 'bg-dark-bg-tertiary text-dark-text-primary border border-dark-border-primary/40 hover:bg-accent-primary/10'}`}>CT-Side</button>
          </div>
          <div className="rounded-xl bg-dark-bg-tertiary/80 px-6 py-3 font-bold text-lg text-dark-text-primary border border-dark-border-primary/40 shadow-sm text-center md:text-right">
            Total Cost: ${totalCost.toFixed(2)}
          </div>
        </div>
        {/* Knives and Gloves on top */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Knives Slot */}
          <div className="glass-card rounded-2xl shadow-dark-lg border border-dark-border-primary/60 flex flex-col items-center relative p-6">
            <h3 className="font-semibold mb-3 text-center w-full text-lg">Knives</h3>
            {selectedSkinsInfo[`knives_${activeSide}side`] ? (
              <div className="space-y-2 w-full flex flex-col items-center">
                <button
                  onClick={() => handleDeselectSkin(`knives_${activeSide}side`)}
                  disabled={saving}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  title="Remove knives"
                >
                  ×
                </button>
                <img 
                  src={selectedSkinsInfo[`knives_${activeSide}side`]?.image} 
                  alt={selectedSkinsInfo[`knives_${activeSide}side`]?.name} 
                  className="w-32 h-32 object-contain rounded mb-2 shadow" 
                />
                <span className="text-xs font-medium text-center">{selectedSkinsInfo[`knives_${activeSide}side`]?.name}</span>
                {selectedSkinsInfo[`knives_${activeSide}side`]?.wear && (
                  <div className="text-xs text-gray-500 text-center">{selectedSkinsInfo[`knives_${activeSide}side`]?.wear}</div>
                )}
                {selectedSkinsInfo[`knives_${activeSide}side`]?.price !== undefined && (
                  <div className="text-xs text-green-700 font-semibold text-center">${selectedSkinsInfo[`knives_${activeSide}side`]?.price?.toFixed(2)}</div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleWeaponSelect(`knives_${activeSide}side`)}
                className="w-32 h-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <img 
                  src={getSideImage('knife', activeSide)} 
                  alt="Default Knife" 
                  className="w-24 h-24 object-contain" 
                />
              </button>
            )}
          </div>

          {/* Gloves Slot */}
          <div className="glass-card rounded-2xl shadow-dark-lg border border-dark-border-primary/60 flex flex-col items-center relative p-6">
            <h3 className="font-semibold mb-3 text-center w-full text-lg">Gloves</h3>
            {selectedSkinsInfo[`gloves_${activeSide}side`] ? (
              <div className="space-y-2 w-full flex flex-col items-center">
                <button
                  onClick={() => handleDeselectSkin(`gloves_${activeSide}side`)}
                  disabled={saving}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  title="Remove gloves"
                >
                  ×
                </button>
                <img 
                  src={selectedSkinsInfo[`gloves_${activeSide}side`]?.image} 
                  alt={selectedSkinsInfo[`gloves_${activeSide}side`]?.name} 
                  className="w-32 h-32 object-contain rounded mb-2 shadow" 
                />
                <span className="text-xs font-medium text-center">{selectedSkinsInfo[`gloves_${activeSide}side`]?.name}</span>
                {selectedSkinsInfo[`gloves_${activeSide}side`]?.wear && (
                  <div className="text-xs text-gray-500 text-center">{selectedSkinsInfo[`gloves_${activeSide}side`]?.wear}</div>
                )}
                {selectedSkinsInfo[`gloves_${activeSide}side`]?.price !== undefined && (
                  <div className="text-xs text-green-700 font-semibold text-center">${selectedSkinsInfo[`gloves_${activeSide}side`]?.price?.toFixed(2)}</div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleWeaponSelect(`gloves_${activeSide}side`)}
                className="w-32 h-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <img 
                  src={getSideImage('gloves', activeSide)} 
                  alt="Default Gloves" 
                  className="w-24 h-24 object-contain" 
                />
              </button>
            )}
          </div>
        </div>

        {/* Weapon Groups */}
        {Object.entries(groupedWeapons).map(([group, weapons]) => (
          <div key={group} className="mb-8 sm:mb-10">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-dark-text-primary tracking-tight">{group}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {weapons.map(weapon => {
                const skinInfo = selectedSkinsInfo[weapon.key];
                const fileName = weapon.name.replace(/[^a-zA-Z0-9-]/g, match => match === ' ' ? ' ' : '').replace(/\s+/g, ' ').trim();
                const defaultImage = getWeaponImage(fileName);
                
                return (
                  <div key={weapon.key} className="glass-card rounded-2xl shadow-dark-lg border border-dark-border-primary/60 flex flex-col items-center relative p-4">
                    <h3 className="font-semibold mb-2 text-sm text-center w-full">{weapon.name}</h3>
                    <div className="w-full flex flex-col items-center">
                      {skinInfo ? (
                        <>
                          <button
                            onClick={() => handleDeselectSkin(weapon.key)}
                            disabled={saving}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            title={`Remove ${weapon.name}`}
                          >
                            ×
                          </button>
                          <img 
                            src={skinInfo.image} 
                            alt={skinInfo.name || weapon.name} 
                            className="w-24 h-24 object-contain rounded mb-2 shadow" 
                          />
                          <span className="text-xs font-medium text-center">{skinInfo.name}</span>
                          {skinInfo.wear && (
                            <div className="text-xs text-gray-500 text-center">{skinInfo.wear}</div>
                          )}
                          {skinInfo.price !== undefined && (
                            <div className="text-xs text-green-700 font-semibold text-center">${skinInfo.price.toFixed(2)}</div>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => handleWeaponSelect(weapon.key)}
                          className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <img 
                            src={defaultImage} 
                            alt={weapon.name} 
                            className="w-20 h-20 object-contain" 
                          />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Skin Selection Modal */}
        {skins.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" style={{ overflow: 'hidden' }}>
            <div
              className="bg-dark-bg-primary w-full h-full m-0 rounded-none absolute w-full h-auto m-0 rounded-2xl max-w-7xl mx-auto shadow-xl overflow-y-auto max-h-[80vh]"
              style={skinModalScrollY !== null ? { top: skinModalScrollY + 20, maxHeight: '80vh' } : {}}
            >
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-dark-bg-primary z-10 pb-4 px-4 border-b border-dark-border-primary/60">
                <h3 className="text-xl font-semibold">Select Skin</h3>
                <button
                  onClick={() => setSkins([])}
                  className="text-dark-text-muted hover:text-dark-text-primary text-2xl px-2 bg-dark-bg-secondary rounded-full w-8 h-8 flex items-center justify-center hover:bg-dark-bg-tertiary transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="grid gap-4 min-w-0 px-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {skins.map(skin => {
                  const enabledWears = skin.wears_extended?.filter(w => w.enabled && w.variant === 'normal') || [];
                  const minPrice = enabledWears.length > 0 ? Math.min(...enabledWears.map(w => w.price)) : 0;
                  const maxPrice = enabledWears.length > 0 ? Math.max(...enabledWears.map(w => w.price)) : 0;
                  return (
                    <button
                      key={skin.id}
                      onClick={() => handleSkinSelect(selectedWeaponId, skin.id)}
                      className="min-w-0 max-w-xs flex flex-col items-center justify-between h-full min-h-[340px] bg-dark-bg-secondary rounded-xl p-4 shadow-xl ring-2 ring-accent-primary/60 transition-all duration-300 transform-gpu group hover:scale-102 hover:shadow-[0_0_16px_4px_rgba(128,0,255,0.18)] hover:ring-[4px] hover:ring-accent-primary/70 hover:ring-offset-1 hover:ring-offset-accent-primary/10 w-full"
                    >
                      <div className="relative w-32 h-32 mb-2">
                        <img src={skin.image} alt={skin.name} className="w-32 h-32 object-contain rounded" />
                        <span role="button" tabIndex={0} onClick={e => { e.stopPropagation(); setShowImageModal(true); setImageModalUrl(skin.image); }}
                          className="absolute bottom-1 right-1 bg-black/60 rounded-full p-1 hover:bg-black/80 focus:outline-none cursor-pointer" title="Enlarge image"
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowImageModal(true); setImageModalUrl(skin.image); } }}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
                        </span>
                      </div>
                      <div className="font-bold mb-1 text-dark-text-primary text-center">{skin.name}</div>
                      <div className="text-lg font-bold mb-1 text-accent-success bg-accent-success/10 px-2 py-1 rounded shadow-sm text-center">{enabledWears.length > 0 ? `$${minPrice === maxPrice ? minPrice : `${minPrice}-${maxPrice}`}` : 'No prices'}</div>
                      <div className="w-4 h-4 rounded-full mt-1" style={{ background: skin.rarity_color }} title="Rarity"></div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Wear Selection Modal */}
        {showWearSelection && selectedSkin && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
            <div
              className="bg-dark-bg-primary w-full h-full m-0 rounded-none p-2 absolute w-full h-auto m-0 rounded-2xl p-4 max-w-md mx-auto shadow-xl overflow-y-auto max-h-[80vh]"
              style={wearModalScrollY !== null ? { top: wearModalScrollY, maxHeight: '80vh' } : {}}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Select Wear</h3>
                <button
                  onClick={() => {
                    setShowWearSelection(false);
                    setSelectedSkin(null);
                  }}
                  className="text-dark-text-muted hover:text-dark-text-primary text-2xl px-2"
                >
                  ✕
                </button>
              </div>
              <div className="mb-4">
                <div className="flex items-center mb-3">
                  <img 
                    src={selectedSkin.image} 
                    alt={selectedSkin.name} 
                    className="w-16 h-16 object-contain mr-3" 
                  />
                  <div>
                    <div className="font-medium">{selectedSkin.name}</div>
                    <div className="text-sm text-gray-500">Choose wear condition</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {['FN', 'MW', 'FT', 'WW', 'BS'].map(wearGrade => {
                  const wearVariants = selectedSkin.wears_extended?.filter(w => w.wear === wearGrade && w.enabled) || [];
                  if (wearVariants.length === 0) return null;

                  const variantColors = {
                    normal: 'text-dark-text-primary',
                    stattrak: 'text-orange-400',
                    souvenir: 'text-yellow-400'
                  };
                  const variantLabels = {
                    normal: 'Normal',
                    stattrak: 'StatTrak',
                    souvenir: 'Souvenir'
                  };

                  return (
                    <div key={wearGrade} className="flex flex-col gap-2">
                      <div className="text-sm font-medium text-dark-text-secondary">{wearGrade}</div>
                      <div className="grid grid-cols-3 gap-2">
                        {wearVariants.map(wear => (
                          <button
                            key={`${wear.wear}-${wear.variant}`}
                            onClick={() => handleWearSelect(wear.wear)}
                            disabled={saving}
                            className={`p-3 rounded-lg border font-bold transition-all text-center shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-primary flex flex-col items-center justify-center gap-1 ${
                              selectedWear === wear.wear
                                ? 'bg-accent-primary text-white border-accent-primary shadow-lg scale-105'
                                : 'bg-dark-bg-secondary text-dark-text-primary border-dark-border-primary/40 hover:bg-accent-primary/10 hover:scale-105'
                            }`}
                          >
                            <div className={`font-bold text-xs ${variantColors[wear.variant as keyof typeof variantColors]}`}>
                              {variantLabels[wear.variant as keyof typeof variantLabels]}
                            </div>
                            <div className="text-xs opacity-75">
                              ${wear.price}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Weapon Type Selection Modal */}
        {showWeaponTypeModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
            <div
              className="bg-dark-bg-primary w-full h-full m-0 rounded-none p-2 absolute w-full h-auto m-0 rounded-2xl p-4 max-w-md mx-auto shadow-xl overflow-y-auto max-h-[80vh]"
              style={typeModalScrollY !== null ? { top: typeModalScrollY, maxHeight: '80vh' } : {}}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Select {showWeaponTypeModal === 'knives' ? 'Knives' : 'Gloves'} Type</h3>
                <button
                  onClick={() => setShowWeaponTypeModal(null)}
                  className="text-dark-text-muted hover:text-dark-text-primary text-2xl px-2"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {weaponTypeOptions.map(w => (
                  <button
                    key={w.id}
                    onClick={() => handleWeaponTypePick(w.name)}
                    className="w-full p-3 border rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && imageModalUrl && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowImageModal(false)}>
            <div
              className="relative bg-dark-bg-primary rounded-2xl max-w-2xl w-full p-4 mx-auto"
              style={imageModalScrollY !== null ? { 
                position: 'absolute',
                top: imageModalScrollY + 20,
                left: '50%',
                transform: 'translateX(-50%)'
              } : {}}
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowImageModal(false)} className="absolute top-2 right-2 text-white text-2xl bg-black/60 rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80 focus:outline-none" title="Close">&times;</button>
              <img src={imageModalUrl} alt="Enlarged skin" className="w-full h-auto max-h-[80vh] rounded shadow-lg mx-auto" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 