import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { isAdmin } from '../utils/admin';
import { supabase } from '../supabaseClient';
import { getSideImage, getWeaponImage } from '../utils/images';

interface Skin {
  id: string;
  name: string;
  image: string;
  wears_extended: WearEntry[];
  rarity_color: string;
}

interface WearEntry {
  wear: string;
  price: number;
  enabled: boolean;
}

interface OfficialLoadout {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface SelectedSkinInfo {
  id: string;
  name: string;
  image: string;
  wear?: string;
  price?: number;
}

type Side = 't' | 'ct';

// Weapon definitions matching the user loadout structure
const weaponDefinitions = {
  // T-Side Only
  tec9_tside: { name: 'Tec-9', side: 't' as const },
  galil_tside: { name: 'Galil AR', side: 't' as const },
  ak47_tside: { name: 'AK-47', side: 't' as const },
  mac10_tside: { name: 'MAC-10', side: 't' as const },
  sawed_off_tside: { name: 'Sawed-Off', side: 't' as const },
  glock18_tside: { name: 'Glock-18', side: 't' as const },
  g3sg1_tside: { name: 'G3SG1', side: 't' as const },
  sg553_tside: { name: 'SG 553', side: 't' as const },
  
  // CT-Side Only
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
  
  // Both Sides
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
  
  // Neutral Equipment
  knives_tside: { name: 'Knives', side: 't' as const },
  knives_ctside: { name: 'Knives', side: 'ct' as const },
  gloves_tside: { name: 'Gloves', side: 't' as const },
  gloves_ctside: { name: 'Gloves', side: 'ct' as const },
};

// Weapon category mapping
const weaponCategoryMap: Record<string, string> = {
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
  'MAC-10': 'SMGs',
  'MP9': 'SMGs',
  'MP7': 'SMGs',
  'MP5-SD': 'SMGs',
  'UMP-45': 'SMGs',
  'P90': 'SMGs',
  'PP-Bizon': 'SMGs',
  'Nova': 'Heavy',
  'XM1014': 'Heavy',
  'MAG-7': 'Heavy',
  'M249': 'Heavy',
  'Negev': 'Heavy',
  'Sawed-Off': 'Heavy',
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

export default function AdminLoadouts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadouts, setLoadouts] = useState<OfficialLoadout[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedLoadout, setSelectedLoadout] = useState<OfficialLoadout | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSide, setActiveSide] = useState<Side>('t');
  const [skins, setSkins] = useState<Skin[]>([]);
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>('');
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
  const [showWearSelection, setShowWearSelection] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [selectedSkinsInfo, setSelectedSkinsInfo] = useState<Record<string, SelectedSkinInfo>>({});
  const [showWeaponTypeModal, setShowWeaponTypeModal] = useState<null | 'knives' | 'gloves'>(null);
  const [weaponTypeOptions, setWeaponTypeOptions] = useState<{ id: string; name: string }[]>([]);

  // Form state for new loadout
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!isAdmin(user)) {
      navigate('/');
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const { data: loadoutsData } = await supabase
        .from('official_loadouts')
        .select('*')
        .order('created_at', { ascending: false });
      setLoadouts(loadoutsData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedLoadout(null);
    setIsEditing(false);
    setTitle('');
    setDescription('');
    setActiveSide('t');
    setSelectedSkinsInfo({});
    setTotalCost(0);
    setShowCreateForm(true);
  };

  const handleEditLoadout = async (loadout: OfficialLoadout) => {
    setSelectedLoadout(loadout);
    setIsEditing(true);
    setTitle(loadout.title);
    setDescription(loadout.description || '');
    setActiveSide('t');
    setShowCreateForm(false);

    // Fetch loadout items and populate selectedSkinsInfo
    await fetchLoadoutItems(loadout.id);
  };

  const fetchLoadoutItems = async (loadoutId: string) => {
    // Fetch the official loadout with all skin fields
    const { data: loadoutData } = await supabase
      .from('official_loadouts')
      .select('*')
      .eq('id', loadoutId)
      .single();

    const skinInfo: Record<string, SelectedSkinInfo> = {};
    
    if (loadoutData) {
      // Process all weapon fields in the loadout
      for (const [weaponKey, skinId] of Object.entries(loadoutData)) {
        if (skinId && weaponKey !== 'id' && weaponKey !== 'title' && weaponKey !== 'description' && 
            weaponKey !== 'created_by' && weaponKey !== 'created_at' && weaponKey !== 'updated_at' &&
            !weaponKey.endsWith('_wear')) { // Skip wear fields
          
          // Skip if skinId is not a valid UUID
          if (typeof skinId !== 'string' || skinId.length < 10) {
            continue;
          }
          
          try {
            // Get wear information from the database
            const wearField = `${weaponKey}_wear`;
            const selectedWear = loadoutData[wearField as keyof typeof loadoutData] as string | undefined;
            
            const { data: skin } = await supabase
              .from('skins')
              .select('id, name, image, wears_extended')
              .eq('id', skinId)
              .single();
            
            if (skin) {
              let wear: string | undefined = undefined;
              let price: number | undefined = undefined;
              
              if (selectedWear) {
                wear = selectedWear;
                // Find the price for the selected wear
                const wearEntry = skin.wears_extended?.find((w: WearEntry) => w.wear === selectedWear && w.enabled);
                if (wearEntry) {
                  price = wearEntry.price;
                }
              } else if (skin.wears_extended && Array.isArray(skin.wears_extended)) {
                // Fallback to first enabled wear
                const enabledWear = skin.wears_extended.find((w: WearEntry) => w.enabled);
                if (enabledWear) {
                  wear = enabledWear.wear;
                  price = enabledWear.price;
                }
              }
              
              skinInfo[weaponKey] = {
                id: skin.id,
                name: skin.name,
                image: skin.image,
                wear,
                price,
              };
            }
          } catch (error) {
            console.warn(`Error processing skin data for ${weaponKey}:`, error);
          }
        }
      }
    }
    
    setSelectedSkinsInfo(skinInfo);
    calculateTotalCost(skinInfo);
  };

  const calculateTotalCost = (skinInfo: Record<string, SelectedSkinInfo>) => {
    const total = Object.values(skinInfo).reduce((sum, info) => {
      return sum + (info.price || 0);
    }, 0);
    setTotalCost(total);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    setSaving(true);

    try {
      if (isEditing && selectedLoadout) {
        // Update existing loadout with skin data
        const updateData = {
          title,
          description,
          updated_at: new Date().toISOString(),
          ...await buildSkinUpdateData()
        };

        const { error: loadoutError } = await supabase
          .from('official_loadouts')
          .update(updateData)
          .eq('id', selectedLoadout.id);

        if (loadoutError) throw loadoutError;
      } else {
        // Create new loadout with skin data
        const insertData = {
          title,
          description,
          created_by: user.id,
          ...await buildSkinUpdateData()
        };

        const { data: newLoadout, error: loadoutError } = await supabase
          .from('official_loadouts')
          .insert(insertData)
          .select()
          .single();

        if (loadoutError) throw loadoutError;
      }

      await fetchData();
      setShowCreateForm(false);
      alert('Loadout saved successfully!');
    } catch (error) {
      console.error('Error saving loadout:', error);
      alert('Error saving loadout');
    } finally {
      setSaving(false);
    }
  };

  const buildSkinUpdateData = async () => {
    const updateData: any = {};
    
    for (const [weaponKey, skinInfo] of Object.entries(selectedSkinsInfo)) {
      // Set the skin ID field (e.g., ak47_tside)
      updateData[weaponKey] = skinInfo.id;
      
      // Set the wear field (e.g., ak47_tside_wear)
      const wearField = `${weaponKey}_wear`;
      if (skinInfo.wear && skinInfo.wear.startsWith('Float: ')) {
        updateData[wearField] = skinInfo.wear.replace('Float: ', '');
      } else if (skinInfo.wear) {
        updateData[wearField] = skinInfo.wear;
      }
    }
    
    return updateData;
  };

  const handleDeleteLoadout = async (loadoutId: string) => {
    if (!confirm('Are you sure you want to delete this loadout?')) return;

    try {
      await supabase
        .from('official_loadouts')
        .delete()
        .eq('id', loadoutId);

      await fetchData();
      alert('Loadout deleted successfully!');
    } catch (error) {
      console.error('Error deleting loadout:', error);
      alert('Error deleting loadout');
    }
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
    const { data: weaponsData } = await supabase
      .from('weapons')
      .select('id, name, category')
      .eq('category', category)
      .order('name');
    setWeaponTypeOptions(weaponsData || []);
  };

  const handleWeaponSelect = async (weaponKey: string) => {
    setSelectedWeaponId(weaponKey);
    if (weaponKey.startsWith('knives') || weaponKey.startsWith('gloves')) {
      const category = weaponKey.startsWith('knives') ? 'knives' : 'gloves';
      setShowWeaponTypeModal(category);
      await fetchWeaponTypeOptions(category === 'knives' ? 'Knives' : 'Gloves');
      return;
    }
    
    const weaponDef = weaponDefinitions[weaponKey as keyof typeof weaponDefinitions];
    if (!weaponDef) return;
    
    const { data: skinsData } = await supabase
      .from('skins')
      .select('id, name, image, wears_extended, rarity_color')
      .eq('weapon', weaponDef.name)
      .order('name');
    
    setSkins(skinsData || []);
  };

  const handleWeaponTypePick = async (weaponTypeName: string) => {
    setShowWeaponTypeModal(null);
    const { data: skinsData } = await supabase
      .from('skins')
      .select('id, name, image, wears_extended, rarity_color')
      .eq('weapon', weaponTypeName)
      .order('name');
    
    setSkins(skinsData || []);
  };

  const handleSkinSelect = async (weaponId: string, skinId: string) => {
    const skin = skins.find(s => s.id === skinId);
    if (!skin) return;

    setSelectedSkin(skin);
    setSkins([]);
    
    const enabledWears = skin.wears_extended?.filter(w => w.enabled) || [];
    if (enabledWears.length === 1) {
      // Auto-select if only one wear option
      await handleWearSelect(enabledWears[0].wear);
    } else if (enabledWears.length > 1) {
      // Show wear selection modal
      setShowWearSelection(true);
    } else {
      // No wear options, just select the skin
      await handleWearSelect('');
    }
  };

  const handleWearSelect = async (wearName: string) => {
    if (!selectedSkin) return;

    const wear = wearName || 'None';
    const price = wearName ? 
      selectedSkin.wears_extended?.find(w => w.wear === wearName)?.price : 
      selectedSkin.wears_extended?.filter(w => w.enabled)[0]?.price;

    const skinInfo: SelectedSkinInfo = {
      id: selectedSkin.id,
      name: selectedSkin.name,
      image: selectedSkin.image,
      wear: wear === 'None' ? undefined : wear,
      price
    };

    setSelectedSkinsInfo(prev => ({
      ...prev,
      [selectedWeaponId]: skinInfo
    }));

    calculateTotalCost({
      ...selectedSkinsInfo,
      [selectedWeaponId]: skinInfo
    });

    setSelectedSkin(null);
    setShowWearSelection(false);
    setSelectedWeaponId('');
  };

  const handleDeselectSkin = async (weaponKey: string) => {
    const newSelectedSkinsInfo = { ...selectedSkinsInfo };
    delete newSelectedSkinsInfo[weaponKey];
    setSelectedSkinsInfo(newSelectedSkinsInfo);
    calculateTotalCost(newSelectedSkinsInfo);
  };

  const handleSideChange = (side: Side) => {
    setActiveSide(side);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

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
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Loadouts</h1>
        <div className="flex gap-4">
          <button
            onClick={handleCreateNew}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create New Loadout
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Back to Admin
          </button>
        </div>
      </div>

      {/* Loadout List */}
      {!showCreateForm && !isEditing && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Existing Loadouts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadouts.map(loadout => (
              <div key={loadout.id} className="border rounded-lg p-4 bg-white shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{loadout.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditLoadout(loadout)}
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLoadout(loadout.id)}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {loadout.description && (
                  <p className="text-gray-600 text-sm mb-2">{loadout.description}</p>
                )}
                <p className="text-xs text-gray-500">
                  Created: {new Date(loadout.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loadout Editor */}
      {(showCreateForm || isEditing) && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              {isEditing ? 'Edit Loadout' : 'Create New Loadout'}
            </h2>
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded"
              >
                {saving ? 'Saving...' : 'Save Loadout'}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setIsEditing(false);
                  setSelectedLoadout(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Basic Info Form */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Loadout title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded px-3 py-2"
                rows={3}
                placeholder="Loadout description"
              />
            </div>
          </div>

          {/* Side Tabs */}
          <div className="flex mb-6">
            <button
              onClick={() => handleSideChange('t')}
              className={`px-6 py-3 font-medium rounded-l-lg border ${
                activeSide === 't' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              T-Side
            </button>
            <button
              onClick={() => handleSideChange('ct')}
              className={`px-6 py-3 font-medium rounded-r-lg border-t border-r border-b ${
                activeSide === 'ct' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              CT-Side
            </button>
          </div>

          {/* Total Cost Display */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Cost: ${totalCost.toFixed(2)}</span>
            </div>
          </div>

          {/* Knives and Gloves */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Knives Slot */}
            <div className="border rounded-lg p-4 flex flex-col items-center relative">
              <h3 className="font-semibold mb-3 text-center w-full">Knives</h3>
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
                  <img src={selectedSkinsInfo[`knives_${activeSide}side`]?.image} alt={selectedSkinsInfo[`knives_${activeSide}side`]?.name} className="w-32 h-32 object-contain rounded mb-2 shadow" />
                  <div className="text-xs font-medium text-center">{selectedSkinsInfo[`knives_${activeSide}side`]?.name}</div>
                  {selectedSkinsInfo[`knives_${activeSide}side`]?.wear && <div className="text-xs text-gray-500 text-center">{selectedSkinsInfo[`knives_${activeSide}side`]?.wear}</div>}
                  {selectedSkinsInfo[`knives_${activeSide}side`]?.price !== undefined && (
                    <div className="text-xs text-green-700 font-semibold text-center">${selectedSkinsInfo[`knives_${activeSide}side`]?.price?.toFixed(2)}</div>
                  )}
                  <button
                    onClick={() => handleWeaponSelect(`knives_${activeSide}side`)}
                    className="text-blue-600 hover:text-blue-700 text-xs mt-2"
                  >
                    Change Knives
                  </button>
                </div>
              ) : (
                <>
                  <img src={getSideImage('knife', activeSide)} alt="Default Knife" className="w-32 h-32 object-contain rounded mb-2 shadow" />
                  <button
                    onClick={() => handleWeaponSelect(`knives_${activeSide}side`)}
                    className="w-full py-2 px-4 border border-gray-300 rounded hover:bg-gray-50 mt-2"
                  >
                    Select Knives
                  </button>
                </>
              )}
            </div>

            {/* Gloves Slot */}
            <div className="border rounded-lg p-4 flex flex-col items-center relative">
              <h3 className="font-semibold mb-3 text-center w-full">Gloves</h3>
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
                  <img src={selectedSkinsInfo[`gloves_${activeSide}side`]?.image} alt={selectedSkinsInfo[`gloves_${activeSide}side`]?.name} className="w-32 h-32 object-contain rounded mb-2 shadow" />
                  <div className="text-xs font-medium text-center">{selectedSkinsInfo[`gloves_${activeSide}side`]?.name}</div>
                  {selectedSkinsInfo[`gloves_${activeSide}side`]?.wear && <div className="text-xs text-gray-500 text-center">{selectedSkinsInfo[`gloves_${activeSide}side`]?.wear}</div>}
                  {selectedSkinsInfo[`gloves_${activeSide}side`]?.price !== undefined && (
                    <div className="text-xs text-green-700 font-semibold text-center">${selectedSkinsInfo[`gloves_${activeSide}side`]?.price?.toFixed(2)}</div>
                  )}
                  <button
                    onClick={() => handleWeaponSelect(`gloves_${activeSide}side`)}
                    className="text-blue-600 hover:text-blue-700 text-xs mt-2"
                  >
                    Change Gloves
                  </button>
                </div>
              ) : (
                <>
                  <img src={getSideImage('gloves', activeSide)} alt="Default Gloves" className="w-32 h-32 object-contain rounded mb-2 shadow" />
                  <button
                    onClick={() => handleWeaponSelect(`gloves_${activeSide}side`)}
                    className="w-full py-2 px-4 border border-gray-300 rounded hover:bg-gray-50 mt-2"
                  >
                    Select Gloves
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Weapon Groups */}
          {Object.entries(groupedWeapons).map(([group, weapons]) => (
            <div key={group} className="mb-8">
              <h2 className="text-xl font-bold mb-4">{group}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {weapons.map(weapon => {
                  const skinInfo = selectedSkinsInfo[weapon.key];
                  let defaultImage = '';
                  const fileName = weapon.name.replace(/[^a-zA-Z0-9-]/g, match => match === ' ' ? ' ' : '').replace(/\s+/g, ' ').trim();
                  defaultImage = getWeaponImage(fileName);
                  
                  return (
                    <div key={weapon.key} className="border rounded-lg p-3 flex flex-col items-center relative">
                      <h3 className="font-semibold mb-2 text-sm text-center w-full">{weapon.name}</h3>
                      <div className="w-full flex flex-col items-center">
                        {skinInfo ? (
                          <>
                            <button
                              onClick={() => handleDeselectSkin(weapon.key)}
                              disabled={saving}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                              title="Remove skin"
                            >
                              ×
                            </button>
                            <img src={skinInfo.image} alt={skinInfo.name} className="w-24 h-24 object-contain rounded mb-2 shadow" />
                            <div className="text-xs font-medium text-center">{skinInfo.name}</div>
                            {skinInfo.wear && <div className="text-xs text-gray-500 text-center">{skinInfo.wear}</div>}
                            {skinInfo.price !== undefined && (
                              <div className="text-xs text-green-700 font-semibold text-center">${skinInfo.price.toFixed(2)}</div>
                            )}
                            <button
                              onClick={() => handleWeaponSelect(weapon.key)}
                              className="text-blue-600 hover:text-blue-700 text-xs mt-2"
                            >
                              Swap
                            </button>
                          </>
                        ) : (
                          <>
                            <img src={defaultImage} alt={weapon.name} className="w-24 h-24 object-contain rounded mb-2 shadow" />
                            <button
                              onClick={() => handleWeaponSelect(weapon.key)}
                              className="w-full py-1 px-3 border border-gray-300 rounded hover:bg-gray-50 text-sm mt-2"
                            >
                              Select Skin
                            </button>
                          </>
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Select Skin</h3>
                  <button
                    onClick={() => setSkins([])}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {skins.map(skin => {
                    const enabledWears = skin.wears_extended?.filter(w => w.enabled) || [];
                    const minPrice = enabledWears.length > 0 ? Math.min(...enabledWears.map(w => w.price)) : 0;
                    const maxPrice = enabledWears.length > 0 ? Math.max(...enabledWears.map(w => w.price)) : 0;
                    return (
                      <button
                        key={skin.id}
                        onClick={() => handleSkinSelect(selectedWeaponId, skin.id)}
                        className="border rounded-lg p-3 hover:bg-gray-50 text-left transition-colors"
                      >
                        <img 
                          src={skin.image} 
                          alt={skin.name} 
                          className="w-full h-32 object-contain mb-3 rounded" 
                        />
                        <div className="text-sm font-medium text-gray-900 mb-1">{skin.name}</div>
                        <div className="flex items-center justify-between">
                          <div className="w-4 h-4 rounded-full" style={{ background: skin.rarity_color }}></div>
                          <div className="text-xs text-gray-500">
                            {enabledWears.length > 0 ? (
                              <span className="text-green-600 font-medium">
                                ${minPrice === maxPrice ? minPrice : `${minPrice}-${maxPrice}`}
                              </span>
                            ) : (
                              'No prices'
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Wear Selection Modal */}
          {showWearSelection && selectedSkin && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Select Wear</h3>
                  <button
                    onClick={() => {
                      setShowWearSelection(false);
                      setSelectedSkin(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
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
                <div className="space-y-2">
                  {selectedSkin.wears_extended?.filter(w => w.enabled).map(wear => (
                    <button
                      key={wear.wear}
                      onClick={() => handleWearSelect(wear.wear)}
                      disabled={saving}
                      className="w-full p-3 border rounded-lg hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{wear.wear}</span>
                        <span className="text-green-600 font-bold">${wear.price}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Weapon Type Selection Modal */}
          {showWeaponTypeModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Select {showWeaponTypeModal === 'knives' ? 'Knives' : 'Gloves'} Type</h3>
                  <button
                    onClick={() => setShowWeaponTypeModal(null)}
                    className="text-gray-500 hover:text-gray-700"
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
        </div>
      )}
    </div>
  );
} 