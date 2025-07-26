import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../store/auth";
import LoadingSkeleton from '../components/LoadingSkeleton';
import { getSideImage, getWeaponImage } from '../utils/images';
import { handleApiError, ErrorType } from '../utils/errorHandling';

// Weapon interface removed as it's not used

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

interface Loadout {
  id: string;
  title: string;
  description?: string;
  budget?: number;
  loadout_type: 'user' | 'official';
  created_at: string;
  user_id?: string; // Add this line
  
  // T-Side Only Weapons
  tec9_tside?: string;
  tec9_tside_wear?: string;
  galil_tside?: string;
  galil_tside_wear?: string;
  ak47_tside?: string;
  ak47_tside_wear?: string;
  mac10_tside?: string;
  mac10_tside_wear?: string;
  sawed_off_tside?: string;
  sawed_off_tside_wear?: string;
  glock18_tside?: string;
  glock18_tside_wear?: string;
  g3sg1_tside?: string;
  g3sg1_tside_wear?: string;
  sg553_tside?: string;
  sg553_tside_wear?: string;
  
  // CT-Side Only Weapons
  mp9_ctside?: string;
  mp9_ctside_wear?: string;
  aug_ctside?: string;
  aug_ctside_wear?: string;
  famas_ctside?: string;
  famas_ctside_wear?: string;
  m4a4_ctside?: string;
  m4a4_ctside_wear?: string;
  m4a1s_ctside?: string;
  m4a1s_ctside_wear?: string;
  p2000_ctside?: string;
  p2000_ctside_wear?: string;
  fiveseven_ctside?: string;
  fiveseven_ctside_wear?: string;
  scar20_ctside?: string;
  scar20_ctside_wear?: string;
  usps_ctside?: string;
  usps_ctside_wear?: string;
  mag7_ctside?: string;
  mag7_ctside_wear?: string;
  
  // Both Sides Weapons - T-Side
  r8_revolver_tside?: string;
  r8_revolver_tside_wear?: string;
  pp_bizon_tside?: string;
  pp_bizon_tside_wear?: string;
  p250_tside?: string;
  p250_tside_wear?: string;
  nova_tside?: string;
  nova_tside_wear?: string;
  desert_eagle_tside?: string;
  desert_eagle_tside_wear?: string;
  xm1014_tside?: string;
  xm1014_tside_wear?: string;
  mp7_tside?: string;
  mp7_tside_wear?: string;
  mp5sd_tside?: string;
  mp5sd_tside_wear?: string;
  awp_tside?: string;
  awp_tside_wear?: string;
  negev_tside?: string;
  negev_tside_wear?: string;
  ssg08_tside?: string;
  ssg08_tside_wear?: string;
  m249_tside?: string;
  m249_tside_wear?: string;
  p90_tside?: string;
  p90_tside_wear?: string;
  cz75auto_tside?: string;
  cz75auto_tside_wear?: string;
  dual_berettas_tside?: string;
  dual_berettas_tside_wear?: string;
  ump45_tside?: string;
  ump45_tside_wear?: string;
  
  // Both Sides Weapons - CT-Side
  r8_revolver_ctside?: string;
  r8_revolver_ctside_wear?: string;
  pp_bizon_ctside?: string;
  pp_bizon_ctside_wear?: string;
  p250_ctside?: string;
  p250_ctside_wear?: string;
  nova_ctside?: string;
  nova_ctside_wear?: string;
  desert_eagle_ctside?: string;
  desert_eagle_ctside_wear?: string;
  xm1014_ctside?: string;
  xm1014_ctside_wear?: string;
  mp7_ctside?: string;
  mp7_ctside_wear?: string;
  mp5sd_ctside?: string;
  mp5sd_ctside_wear?: string;
  awp_ctside?: string;
  awp_ctside_wear?: string;
  negev_ctside?: string;
  negev_ctside_wear?: string;
  ssg08_ctside?: string;
  ssg08_ctside_wear?: string;
  m249_ctside?: string;
  m249_ctside_wear?: string;
  p90_ctside?: string;
  p90_ctside_wear?: string;
  cz75auto_ctside?: string;
  cz75auto_ctside_wear?: string;
  dual_berettas_ctside?: string;
  dual_berettas_ctside_wear?: string;
  ump45_ctside?: string;
  ump45_ctside_wear?: string;
  
  // Neutral Equipment
  knife?: string;
  knife_wear?: string;
  gloves?: string;
  gloves_wear?: string;
  knives_ctside?: string;
  knives_ctside_wear?: string;
  gloves_ctside?: string;
  gloves_ctside_wear?: string;
  knives_tside?: string;
  knives_tside_wear?: string;
  gloves_tside?: string;
  gloves_tside_wear?: string;
}

interface SelectedSkinInfo {
  id: string;
  name: string;
  image: string;
  wear?: string;
  price?: number;
}

type Side = 't' | 'ct';

// Weapon definitions for the new structure with separate T-side and CT-side entries
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
  
  // Both Sides - now have separate T-side and CT-side entries
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
  
  // Neutral Equipment - now specific to sides
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

export default function LoadoutDetail() {
  const { loadoutType, loadoutId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSide, setActiveSide] = useState<Side>('t');
  const [loadout, setLoadout] = useState<Loadout | null>(null);
  const [skins, setSkins] = useState<Skin[]>([]);
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>('');
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
  const [showWearSelection, setShowWearSelection] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [selectedSkinsInfo, setSelectedSkinsInfo] = useState<Record<string, SelectedSkinInfo>>({});
  const [showWeaponTypeModal, setShowWeaponTypeModal] = useState<null | 'knives' | 'gloves'>(null);
  const [weaponTypeOptions, setWeaponTypeOptions] = useState<{ id: string; name: string }[]>([]);
  // pendingSlot removed as it's not used

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
      // Fetch loadout details
      const tableName = loadoutType === 'user' ? 'user_loadouts' : 'official_loadouts';
        const { data: loadoutData, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', loadoutId)
        .single();
      
        if (error) {
          if (error.code === 'PGRST116') {
            // No rows returned - loadout not found
            handleApiError({ status: 404, message: 'Loadout not found' }, navigate);
            return;
          }
          throw error;
        }
        
      if (loadoutData) {
        console.log('Loaded loadout data:', loadoutData);
        setLoadout({ ...loadoutData, loadout_type: loadoutType as 'user' | 'official' });
        } else {
          handleApiError({ status: 404, message: 'Loadout not found' }, navigate);
          return;
        }
      } catch (error) {
        console.error('Error fetching loadout:', error);
        handleApiError(error, navigate);
        return;
      } finally {
      setLoading(false);
      }
    };

    if (loadoutId && loadoutType) {
      fetchData();
    }
  }, [loadoutId, loadoutType]);

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

  // Fetch weapon types for knives or gloves
  const fetchWeaponTypeOptions = async (category: 'Knives' | 'Gloves') => {
    const { data: weaponsData, error } = await supabase
      .from('weapons')
      .select('id, name, category')
      .eq('category', category)
      .order('name');
    if (error) {
      setWeaponTypeOptions([]);
    } else {
      setWeaponTypeOptions(weaponsData || []);
    }
  };

  // Refactored weapon select handler
  const handleWeaponSelect = async (weaponKey: string) => {
    // Prevent modifications for official loadouts
    if (loadout?.loadout_type === 'official') {
      return;
    }
    
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
    const { data: skinsData, error } = await supabase
      .from('skins')
      .select('id, name, image, wears_extended, rarity_color')
      .eq('weapon', weaponDef.name)
      .order('name');
    if (error) {
      setSkins([]);
    } else if (skinsData) {
      setSkins(skinsData);
    }
  };

  // Step 2 for knife/glove: user picks weapon type
  const handleWeaponTypePick = async (weaponTypeName: string) => {
    setShowWeaponTypeModal(null);
    setSelectedWeaponId(selectedWeaponId); // keep slot
    // Fetch skins for the selected weapon type
    const { data: skinsData, error } = await supabase
      .from('skins')
      .select('id, name, image, wears_extended, rarity_color')
      .eq('weapon', weaponTypeName)
      .order('name');
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
    if (!loadout || !selectedSkin) return;
    
    console.log('handleWearSelect called with:', { wearName, selectedSkin, selectedWeaponId });
    
    // Validate that selectedSkin.id is a proper UUID
    if (!selectedSkin.id || selectedSkin.id.length < 10) {
      console.error('Invalid skin ID:', selectedSkin.id);
      return;
    }
    
    setSaving(true);
    
    // Find the selected wear entry to get the price
    const selectedWearEntry = selectedSkin.wears_extended?.find(w => w.wear === wearName && w.enabled);
    if (!selectedWearEntry) {
      console.error('Selected wear not found or not enabled:', wearName);
      setSaving(false);
      return;
    }
    
    // Store both skin ID and wear in the database
    const tableName = loadout.loadout_type === 'user' ? 'user_loadouts' : 'official_loadouts';
    const wearField = `${selectedWeaponId}_wear`;
    const updateData = { 
      [selectedWeaponId]: selectedSkin.id,
      [wearField]: wearName
    };
    
    console.log('Updating loadout with:', { tableName, updateData, loadoutId: loadout.id });
    
    const { error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', loadout.id);
    
    if (error) {
      console.error('Error updating loadout:', error);
    } else {
      console.log('Successfully updated loadout');
      // Update local state
      setLoadout(prev => prev ? { 
        ...prev, 
        [selectedWeaponId]: selectedSkin.id,
        [wearField]: wearName
      } : null);
    }
    
    setSaving(false);
    setSkins([]);
    setShowWearSelection(false);
    setSelectedSkin(null);
  };

  // New function to deselect a skin
  const handleDeselectSkin = async (weaponKey: string) => {
    if (!loadout) return;
    
    // Prevent modifications for official loadouts
    if (loadout.loadout_type === 'official') {
      return;
    }
    
    setSaving(true);
    
    // Update the loadout to remove the skin and wear
    const tableName = loadout.loadout_type === 'user' ? 'user_loadouts' : 'official_loadouts';
    const wearField = `${weaponKey}_wear`;
    const updateData = { 
      [weaponKey]: null,
      [wearField]: null
    };
    
    const { error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', loadout.id);
    
    if (error) {
      console.error('Error deselecting skin:', error);
    } else {
      console.log('Successfully deselected skin');
      // Update local state
      setLoadout(prev => prev ? { 
        ...prev, 
        [weaponKey]: null,
        [wearField]: null
      } : null);
    }
    
    setSaving(false);
  };

  // New function to delete the entire loadout
  const handleDeleteLoadout = async () => {
    if (!loadout || !user || loadout.loadout_type !== 'user') return;
    
    const confirmed = window.confirm('Are you sure you want to delete this loadout? This action cannot be undone.');
    if (!confirmed) return;
    
    setSaving(true);
    
    const { error } = await supabase
      .from('user_loadouts')
      .delete()
      .eq('id', loadout.id)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error deleting loadout:', error);
      alert('Failed to delete loadout. Please try again.');
    } else {
      console.log('Successfully deleted loadout');
      // Navigate back to loadouts page
      navigate('/loadouts');
    }
    
    setSaving(false);
  };

  // New function to copy official loadout to user's personal loadouts
  const handleCopyLoadout = async () => {
    if (!loadout || !user || loadout.loadout_type !== 'official') return;
    
    setSaving(true);
    
    try {
      // Create a new user loadout with the same data
      const { data: newLoadout, error } = await supabase
        .from('user_loadouts')
        .insert({
          user_id: user.id,
          title: `${loadout.title} (Copy)`,
          description: loadout.description || '',
          budget: null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Copy all skin data from official loadout to user loadout
      const updateData: any = {};
      
      // Copy all weapon fields
      for (const [key, value] of Object.entries(loadout)) {
        if (key !== 'id' && key !== 'title' && key !== 'description' && 
            key !== 'created_by' && key !== 'created_at' && key !== 'updated_at' &&
            key !== 'loadout_type' && key !== 'user_id' && key !== 'budget') {
          updateData[key] = value;
        }
      }
      
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('user_loadouts')
          .update(updateData)
          .eq('id', newLoadout.id);
        
        if (updateError) throw updateError;
      }
      
      // Navigate to the new user loadout for editing
      navigate(`/loadouts/user/${newLoadout.id}`);
      
    } catch (error) {
      console.error('Error copying loadout:', error);
      alert('Failed to copy loadout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const calculateTotalCost = async () => {
    if (!loadout) return 0;
    
    let totalCost = 0;
    
    // Check all weapon fields in the loadout
    for (const [weaponKey, skinId] of Object.entries(loadout)) {
      if (skinId && weaponKey !== 'id' && weaponKey !== 'title' && weaponKey !== 'description' && 
          weaponKey !== 'budget' && weaponKey !== 'loadout_type' && weaponKey !== 'created_at' &&
          weaponKey !== 'user_id' && weaponKey !== 'created_by' && weaponKey !== 'updated_at' &&
          !weaponKey.endsWith('_wear')) { // Skip wear fields
        
        // Skip if skinId is not a valid UUID
        if (typeof skinId !== 'string' || skinId.length < 10) {
          continue;
        }
        
        try {
          // Get wear information from the database
          const wearField = `${weaponKey}_wear`;
          const selectedWear = loadout[wearField as keyof Loadout] as string | undefined;
          
          if (selectedWear) {
            // Fetch skin data to get the price for the selected wear
            const { data: skinData, error } = await supabase
              .from('skins')
              .select('wears_extended')
              .eq('id', skinId)
              .single();
            
            if (error) {
              console.warn(`Error fetching skin ${skinId}:`, error);
              continue;
            }
            
            if (skinData?.wears_extended) {
              const wearEntry = skinData.wears_extended.find((w: WearEntry) => w.wear === selectedWear && w.enabled);
              if (wearEntry) {
                totalCost += wearEntry.price;
              } else {
                // Fallback to first available wear price
                const enabledWears = skinData.wears_extended.filter((w: WearEntry) => w.enabled);
                if (enabledWears.length > 0) {
                  totalCost += enabledWears[0].price;
                }
              }
            }
          } else {
            // Fallback: fetch skin data and use first available wear price
            const { data: skinData, error } = await supabase
              .from('skins')
              .select('wears_extended')
              .eq('id', skinId)
              .single();
            
            if (error) {
              console.warn(`Error fetching skin ${skinId}:`, error);
              continue;
            }
            
            if (skinData?.wears_extended) {
              const enabledWears = skinData.wears_extended.filter((w: WearEntry) => w.enabled);
              if (enabledWears.length > 0) {
                totalCost += enabledWears[0].price; // Use first available price
              }
            }
          }
        } catch (error) {
          console.warn(`Error processing skin data for ${weaponKey}:`, error);
          continue;
        }
      }
    }
    
    return totalCost;
  };

  useEffect(() => {
    const updateTotalCost = async () => {
      if (loadout) {
        const cost = await calculateTotalCost();
        setTotalCost(Math.round(cost * 100) / 100); // Round to 2 decimals
      }
    };
    
    updateTotalCost();
  }, [loadout]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch selected skin info for all slots
  useEffect(() => {
    const fetchSelectedSkins = async () => {
      if (!loadout) return;
      const skinInfo: Record<string, SelectedSkinInfo> = {};
      
      if (loadout.loadout_type === 'official') {
        // For official loadouts, read from direct fields (same as user loadouts)
        const weaponKeys = Object.keys(weaponDefinitions).concat(['knife', 'gloves']);
        for (const weaponKey of weaponKeys) {
          const skinId = loadout[weaponKey as keyof Loadout] as string | undefined;
          if (skinId && typeof skinId === 'string' && skinId.length > 10) {
            try {
              // Get wear information from the database
              const wearField = `${weaponKey}_wear`;
              const selectedWear = loadout[wearField as keyof Loadout] as string | undefined;
              
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
      } else {
        // For user loadouts, read from direct fields (existing logic)
        const weaponKeys = Object.keys(weaponDefinitions).concat(['knife', 'gloves']);
        for (const weaponKey of weaponKeys) {
          const skinId = loadout[weaponKey as keyof Loadout] as string | undefined;
          if (skinId && typeof skinId === 'string' && skinId.length > 10) {
            try {
              // Get wear information from the database
              const wearField = `${weaponKey}_wear`;
              const selectedWear = loadout[wearField as keyof Loadout] as string | undefined;
              
              const { data: skin } = await supabase
                .from('skins')
                .select('id, name, image, wears_extended')
                .eq('id', skinId)
                .single();
              if (skin) {
                let wear: string | undefined = undefined;
                let price: number | undefined = undefined;
                
                if (selectedWear) {
                  // Use the stored wear from database
                  wear = selectedWear;
                  // Find the price for the selected wear
                  const wearEntry = skin.wears_extended?.find((w: WearEntry) => w.wear === selectedWear && w.enabled);
                  if (wearEntry) {
                    price = wearEntry.price;
                  }
                } else if (skin.wears_extended && Array.isArray(skin.wears_extended)) {
                  // Fallback to first enabled wear (old format)
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
    };
    fetchSelectedSkins();
  }, [loadout]);

  if (loading) return (
    <div className="max-w-5xl mx-auto py-8 px-2 sm:px-6">
      <div className="glass-card p-6 md:p-8 shadow-dark-lg border border-dark-border-primary/60 mb-8">
        <h1 className="text-3xl font-bold mb-2 text-dark-text-primary tracking-tight">Loadout Details</h1>
        <LoadingSkeleton type="skeleton" lines={10} />
      </div>
    </div>
  );
  if (!loadout) return (
    <div className="max-w-5xl mx-auto py-8 px-2 sm:px-6">
      <div className="glass-card p-6 md:p-8 shadow-dark-lg border border-dark-border-primary/60 mb-8">
        <h1 className="text-3xl font-bold mb-2 text-dark-text-primary tracking-tight">Loadout Details</h1>
        <div className="py-16 text-accent-error text-lg text-center">Loadout not found.</div>
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
    <div className="max-w-5xl mx-auto py-8 px-2 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent tracking-tight mb-2 md:mb-0">
          {loadout.title}
        </h1>
        <div className="flex gap-3 flex-wrap justify-start md:justify-end">
          <button onClick={() => navigate('/loadouts')} className="btn-secondary px-5 py-2 rounded-xl font-semibold text-base">Back to Loadouts</button>
          {loadout.loadout_type === 'user' && (
            <button onClick={() => navigate(`/loadouts/edit/${loadout.id}`)} className="btn-primary px-5 py-2 rounded-xl font-semibold text-base">Edit</button>
          )}
          {loadout.loadout_type === 'user' && (
            <button onClick={handleDeleteLoadout} className="btn-secondary border-accent-error/40 text-accent-error hover:bg-accent-error/10 px-5 py-2 rounded-xl font-semibold text-base">Delete Loadout</button>
          )}
          {loadout.loadout_type === 'official' && (
            <button onClick={handleCopyLoadout} className="btn-primary px-5 py-2 rounded-xl font-semibold text-base">Save Loadout</button>
          )}
        </div>
      </div>
      <div className="glass-card p-6 md:p-8 shadow-dark-lg border border-dark-border-primary/60 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button onClick={() => setActiveSide('t')} className={`px-6 py-2 rounded-xl font-bold text-base transition-all ${activeSide === 't' ? 'bg-accent-primary text-white shadow' : 'bg-dark-bg-tertiary text-dark-text-primary border border-dark-border-primary/40 hover:bg-accent-primary/10'}`}>T-Side</button>
            <button onClick={() => setActiveSide('ct')} className={`px-6 py-2 rounded-xl font-bold text-base transition-all ${activeSide === 'ct' ? 'bg-accent-primary text-white shadow' : 'bg-dark-bg-tertiary text-dark-text-primary border border-dark-border-primary/40 hover:bg-accent-primary/10'}`}>CT-Side</button>
          </div>
          <div className="rounded-xl bg-dark-bg-tertiary/80 px-6 py-3 font-bold text-lg text-dark-text-primary border border-dark-border-primary/40 shadow-sm text-center md:text-right flex flex-col items-end gap-1">
            <span className="font-semibold text-dark-text-primary text-lg">Total Cost: ${totalCost.toFixed(2)}</span>
            {loadout.budget && (
              <span className="text-sm text-dark-text-tertiary font-medium">Budget: ${parseFloat(String(loadout.budget))}</span>
            )}
            {loadout.budget && totalCost > parseFloat(String(loadout.budget)) && (
              <span className="text-sm text-accent-error font-semibold">Over Budget: ${(totalCost - parseFloat(String(loadout.budget))).toFixed(2)}</span>
            )}
          </div>
        </div>
        {/* Knives and Gloves on top */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Knives Slot */}
          <div className="glass-card rounded-2xl shadow-dark-lg border border-dark-border-primary/60 flex flex-col items-center relative p-6">
            <h3 className="font-semibold mb-3 text-center w-full text-lg">Knives</h3>
            {loadout[`knives_${activeSide}side` as keyof Loadout] && selectedSkinsInfo[`knives_${activeSide}side`] ? (
              <div className="space-y-2 w-full flex flex-col items-center">
                <a href={`/skins/${selectedSkinsInfo[`knives_${activeSide}side`]?.id}`} className="block" tabIndex={-1}>
                  <img src={selectedSkinsInfo[`knives_${activeSide}side`]?.image} alt={selectedSkinsInfo[`knives_${activeSide}side`]?.name} className="w-32 h-32 object-contain rounded mb-2 shadow transition-transform hover:scale-105" />
                </a>
                <a href={`/skins/${selectedSkinsInfo[`knives_${activeSide}side`]?.id}`} className="text-xs font-medium text-center hover:underline" tabIndex={-1}>{selectedSkinsInfo[`knives_${activeSide}side`]?.name}</a>
                {selectedSkinsInfo[`knives_${activeSide}side`]?.wear && <div className="text-xs text-gray-500 text-center">{selectedSkinsInfo[`knives_${activeSide}side`]?.wear}</div>}
                {selectedSkinsInfo[`knives_${activeSide}side`]?.price !== undefined && (
                  <div className="text-xs text-green-700 font-semibold text-center">${selectedSkinsInfo[`knives_${activeSide}side`]?.price?.toFixed(2)}</div>
                )}
              </div>
            ) : (
              <>
                <img src={getSideImage('knife', activeSide)} alt="Default Knife" className="w-32 h-32 object-contain rounded mb-2 shadow" />
              </>
            )}
          </div>
          {/* Gloves Slot */}
          <div className="glass-card rounded-2xl shadow-dark-lg border border-dark-border-primary/60 flex flex-col items-center relative p-6">
            <h3 className="font-semibold mb-3 text-center w-full text-lg">Gloves</h3>
            {loadout[`gloves_${activeSide}side` as keyof Loadout] && selectedSkinsInfo[`gloves_${activeSide}side`] ? (
              <div className="space-y-2 w-full flex flex-col items-center">
                <a href={`/skins/${selectedSkinsInfo[`gloves_${activeSide}side`]?.id}`} className="block" tabIndex={-1}>
                  <img src={selectedSkinsInfo[`gloves_${activeSide}side`]?.image} alt={selectedSkinsInfo[`gloves_${activeSide}side`]?.name} className="w-32 h-32 object-contain rounded mb-2 shadow transition-transform hover:scale-105" />
                </a>
                <a href={`/skins/${selectedSkinsInfo[`gloves_${activeSide}side`]?.id}`} className="text-xs font-medium text-center hover:underline" tabIndex={-1}>{selectedSkinsInfo[`gloves_${activeSide}side`]?.name}</a>
                {selectedSkinsInfo[`gloves_${activeSide}side`]?.wear && <div className="text-xs text-gray-500 text-center">{selectedSkinsInfo[`gloves_${activeSide}side`]?.wear}</div>}
                {selectedSkinsInfo[`gloves_${activeSide}side`]?.price !== undefined && (
                  <div className="text-xs text-green-700 font-semibold text-center">${selectedSkinsInfo[`gloves_${activeSide}side`]?.price?.toFixed(2)}</div>
                )}
              </div>
            ) : (
              <>
                <img src={getSideImage('gloves', activeSide)} alt="Default Gloves" className="w-32 h-32 object-contain rounded mb-2 shadow" />
              </>
            )}
          </div>
        </div>
        {/* Weapon Groups */}
        {Object.entries(groupedWeapons).map(([group, weapons]) => (
          <div key={group} className="mb-10">
            <h2 className="text-xl font-bold mb-4 text-dark-text-primary tracking-tight">{group}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {weapons.map(weapon => {
                const selectedSkinId = loadout[weapon.key as keyof Loadout] as string;
                const skinInfo = selectedSkinsInfo[weapon.key];
                // Determine default image path
                let defaultImage = '';
                if (weapon.name === 'Knives') {
                  defaultImage = getSideImage('knife', activeSide);
                } else if (weapon.name === 'Gloves') {
                  defaultImage = getSideImage('gloves', activeSide);
                } else {
                  defaultImage = getWeaponImage(weapon.name);
                }
                return (
                  <div key={weapon.key} className="glass-card rounded-2xl shadow-dark-lg border border-dark-border-primary/60 flex flex-col items-center relative p-4">
                    <h3 className="font-semibold mb-2 text-sm text-center w-full">{weapon.name}</h3>
                    <div className="w-full flex flex-col items-center">
                      {selectedSkinId && skinInfo ? (
                        <>
                          <a href={`/skins/${skinInfo.id}`} className="block" tabIndex={-1}>
                            <img src={skinInfo.image} alt={skinInfo.name} className="w-24 h-24 object-contain rounded mb-2 shadow transition-transform hover:scale-105" />
                          </a>
                          <a href={`/skins/${skinInfo.id}`} className="text-xs font-medium text-center hover:underline" tabIndex={-1}>{skinInfo.name}</a>
                          {skinInfo.wear && <div className="text-xs text-gray-500 text-center">{skinInfo.wear}</div>}
                          {skinInfo.price !== undefined && (
                            <div className="text-xs text-green-700 font-semibold text-center">${skinInfo.price.toFixed(2)}</div>
                          )}
                        </>
                      ) : (
                        <>
                          <img src={defaultImage} alt={weapon.name} className="w-24 h-24 object-contain rounded mb-2 shadow" />
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
          <div className="modal-overlay">
            <div className="modal-content max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Select Skin</h3>
                <button
                  onClick={() => setSkins([])}
                  className="text-dark-text-muted hover:text-dark-text-primary text-2xl px-2"
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
          <div className="modal-overlay">
            <div className="modal-content max-w-md">
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
          <div className="modal-overlay">
            <div className="modal-content max-w-md max-h-[80vh] overflow-y-auto">
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
      </div>
    </div>
  );
}