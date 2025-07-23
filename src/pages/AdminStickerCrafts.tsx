import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { isAdmin } from '../utils/admin';
import { supabase } from '../supabaseClient';
// If you haven't already, run: npm install uuid
import { v4 as uuidv4 } from 'uuid';

interface Skin {
  id: string;
  name: string;
  weapon: string;
}

interface StickerCraft {
  id: string;
  name: string;
  description: string;
  skin_id: string;
  ingame_image: string;
  placement_image: string;
  external_craft_link: string;
  created_at: string;
  updated_at: string;
}

interface StickerCraftSticker {
  id: string;
  name: string;
  image: string;
  price: number;
  external_link: string;
  position: number;
  last_updated: string;
}

interface StickerFormData {
  name: string;
  image: string;
  price: number;
  external_link: string;
}

// Add a helper function to upload images to Supabase Storage
async function uploadImageToSupabase(file: File, path: string): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from('sticker-crafts')
      .upload(path, file, { upsert: true });
    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }
    const { publicUrl } = supabase.storage.from('sticker-crafts').getPublicUrl(path).data;
    console.log('Supabase upload success:', data, publicUrl);
    return publicUrl;
  } catch (err) {
    console.error('Upload exception:', err);
    throw err;
  }
}

export default function AdminStickerCrafts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skins, setSkins] = useState<Skin[]>([]);
  const [crafts, setCrafts] = useState<StickerCraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCraft, setSelectedCraft] = useState<StickerCraft | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [skinId, setSkinId] = useState('');
  const [ingameImage, setIngameImage] = useState('');
  const [placementImage, setPlacementImage] = useState('');
  const [externalCraftLink, setExternalCraftLink] = useState('');
  const [stickers, setStickers] = useState<StickerFormData[]>([
    { name: '', image: '', price: 0, external_link: '' },
    { name: '', image: '', price: 0, external_link: '' },
    { name: '', image: '', price: 0, external_link: '' },
    { name: '', image: '', price: 0, external_link: '' },
    { name: '', image: '', price: 0, external_link: '' }
  ]);

  // Add state for temporary craftId for new crafts
  const [tempCraftId, setTempCraftId] = useState(() => uuidv4());

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

  // Add user logging on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error('Error fetching user:', error);
      } else {
        console.log('Supabase user:', data.user);
        if (data.user) {
          console.log('Supabase user email:', data.user.email);
        }
      }
    });
  }, []);

  const fetchData = async () => {
    try {
      // Fetch skins
      const { data: skinsData } = await supabase
        .from('skins')
        .select('id, name, weapon')
        .order('name');
      setSkins(skinsData || []);

      // Fetch sticker crafts
      const { data: craftsData } = await supabase
        .from('sticker_crafts')
        .select('*')
        .order('created_at', { ascending: false });
      setCrafts(craftsData || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedCraft(null);
    setIsEditing(false);
    setName('');
    setDescription('');
    setSkinId('');
    setIngameImage('');
    setPlacementImage('');
    setExternalCraftLink('');
    setStickers([
      { name: '', image: '', price: 0, external_link: '' },
      { name: '', image: '', price: 0, external_link: '' },
      { name: '', image: '', price: 0, external_link: '' },
      { name: '', image: '', price: 0, external_link: '' },
      { name: '', image: '', price: 0, external_link: '' }
    ]);
    setTempCraftId(uuidv4());
  };

  const handleEditCraft = async (craft: StickerCraft) => {
    setSelectedCraft(craft);
    setIsEditing(true);
    setName(craft.name);
    setDescription(craft.description || '');
    setSkinId(craft.skin_id);
    setIngameImage(craft.ingame_image || '');
    setPlacementImage(craft.placement_image || '');
    setExternalCraftLink(craft.external_craft_link || '');

    // Fetch stickers
    const { data: stickersData } = await supabase
      .from('sticker_craft_stickers')
      .select('*')
      .eq('craft_id', craft.id)
      .order('position');

    const newStickers = [
      { name: '', image: '', price: 0, external_link: '' },
      { name: '', image: '', price: 0, external_link: '' },
      { name: '', image: '', price: 0, external_link: '' },
      { name: '', image: '', price: 0, external_link: '' },
      { name: '', image: '', price: 0, external_link: '' }
    ];

    stickersData?.forEach(sticker => {
      if (sticker.position >= 1 && sticker.position <= 5) {
        newStickers[sticker.position - 1] = {
          name: sticker.name,
          image: sticker.image || '',
          price: sticker.price || 0,
          external_link: sticker.external_link || ''
        };
      }
    });

    setStickers(newStickers);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Name is required');
      return;
    }

    if (!skinId) {
      alert('Skin is required');
      return;
    }

    setSaving(true);

    try {
      if (isEditing && selectedCraft) {
        // Update existing craft
        const { error: craftError } = await supabase
          .from('sticker_crafts')
          .update({
            name,
            description,
            skin_id: skinId,
            ingame_image: ingameImage,
            placement_image: placementImage,
            external_craft_link: externalCraftLink,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedCraft.id);

        if (craftError) throw craftError;

        // Delete existing stickers
        await supabase
          .from('sticker_craft_stickers')
          .delete()
          .eq('craft_id', selectedCraft.id);

        // Insert new stickers
        await insertStickers(selectedCraft.id);
      } else {
        // Create new craft
        const { data: newCraft, error: craftError } = await supabase
          .from('sticker_crafts')
          .insert({
            name,
            description,
            skin_id: skinId,
            ingame_image: ingameImage,
            placement_image: placementImage,
            external_craft_link: externalCraftLink,
            created_by: user.id
          })
          .select()
          .single();

        if (craftError) throw craftError;

        // Insert stickers
        await insertStickers(newCraft.id);
      }

      await fetchData();
      handleCreateNew();
      alert('Sticker craft saved successfully!');
    } catch (error) {
      console.error('Error saving sticker craft:', error);
      alert('Error saving sticker craft');
    } finally {
      setSaving(false);
    }
  };

  const insertStickers = async (craftId: string) => {
    for (let i = 0; i < stickers.length; i++) {
      const sticker = stickers[i];
      if (sticker.name.trim()) {
        await supabase
          .from('sticker_craft_stickers')
          .insert({
            craft_id: craftId,
            name: sticker.name,
            image: sticker.image,
            price: sticker.price,
            external_link: sticker.external_link,
            position: i + 1
          });
      }
    }
  };

  const handleDeleteCraft = async (craftId: string) => {
    if (!confirm('Are you sure you want to delete this sticker craft?')) return;

    try {
      // Delete stickers first
      await supabase
        .from('sticker_craft_stickers')
        .delete()
        .eq('craft_id', craftId);

      // Delete craft
      await supabase
        .from('sticker_crafts')
        .delete()
        .eq('id', craftId);

      await fetchData();
      alert('Sticker craft deleted successfully!');
    } catch (error) {
      console.error('Error deleting sticker craft:', error);
      alert('Error deleting sticker craft');
    }
  };

  const updateSticker = (index: number, field: keyof StickerFormData, value: any) => {
    const newStickers = [...stickers];
    newStickers[index] = { ...newStickers[index], [field]: value };
    setStickers(newStickers);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-dark-text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Admin Sticker Crafts</h1>
            <p className="text-dark-text-secondary">Manage sticker crafts for the community</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="btn-primary"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Craft
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Craft List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-dark-text-primary">Existing Crafts</h2>
          <div className="space-y-4">
            {crafts.map(craft => (
              <div key={craft.id} className="glass-card p-6 card-hover">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-dark-text-primary text-lg mb-2">{craft.name}</h3>
                    {craft.description && (
                      <p className="text-dark-text-secondary text-sm mb-3">{craft.description}</p>
                    )}
                    <p className="text-xs text-dark-text-muted">
                      Created: {new Date(craft.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditCraft(craft)}
                      className="btn-ghost text-sm px-3 py-1"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCraft(craft.id)}
                      className="text-accent-error hover:text-red-400 text-sm px-3 py-1 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {crafts.length === 0 && (
              <div className="glass-card p-8 text-center">
                <div className="text-dark-text-muted mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <p className="text-dark-text-muted">No sticker crafts created yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Craft Editor */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-dark-text-primary">
            {isEditing ? 'Edit Sticker Craft' : 'Create New Sticker Craft'}
          </h2>
          
          <div className="glass-card p-6 space-y-6">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-dark w-full"
                placeholder="Craft name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-dark w-full"
                rows={3}
                placeholder="Craft description"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Skin *</label>
              <select
                value={skinId}
                onChange={(e) => setSkinId(e.target.value)}
                className="input-dark w-full"
              >
                <option value="">Select Skin</option>
                {skins.map(skin => (
                  <option key={skin.id} value={skin.id}>
                    {skin.name} ({skin.weapon})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">In-Game Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const craftId = isEditing && selectedCraft ? selectedCraft.id : tempCraftId;
                    const path = `${craftId}/ingame.${file.name.split('.').pop()}`;
                    const url = await uploadImageToSupabase(file, path);
                    setIngameImage(url);
                  } catch (err) {
                    const errorMsg = err instanceof Error ? err.message : String(err);
                    console.error('Image upload failed (ingame):', err);
                    alert('Ingame image upload failed: ' + errorMsg);
                  }
                }}
                className="input-dark w-full"
              />
              {ingameImage && (
                <div className="mt-2">
                  <img src={ingameImage} alt="Ingame" className="max-h-32 rounded-lg" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Placement Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const craftId = isEditing && selectedCraft ? selectedCraft.id : tempCraftId;
                    const path = `${craftId}/placement.${file.name.split('.').pop()}`;
                    const url = await uploadImageToSupabase(file, path);
                    setPlacementImage(url);
                  } catch (err) {
                    const errorMsg = err instanceof Error ? err.message : String(err);
                    console.error('Image upload failed (placement):', err);
                    alert('Placement image upload failed: ' + errorMsg);
                  }
                }}
                className="input-dark w-full"
              />
              {placementImage && (
                <div className="mt-2">
                  <img src={placementImage} alt="Placement" className="max-h-32 rounded-lg" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">External Craft Link</label>
              <input
                type="url"
                value={externalCraftLink}
                onChange={(e) => setExternalCraftLink(e.target.value)}
                className="input-dark w-full"
                placeholder="https://example.com/craft-view"
              />
            </div>

            {/* Stickers */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-dark-text-primary">Stickers (up to 5)</h3>
              <div className="space-y-4">
                {stickers.map((sticker, index) => (
                  <div key={index} className="glass-card p-4 bg-dark-bg-tertiary/30">
                    <h4 className="font-medium text-dark-text-primary mb-3">Sticker {index + 1}</h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={sticker.name}
                        onChange={(e) => updateSticker(index, 'name', e.target.value)}
                        className="input-dark w-full text-sm"
                        placeholder="Sticker name"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const craftId = isEditing && selectedCraft ? selectedCraft.id : tempCraftId;
                            const path = `${craftId}/stickers/${index + 1}.${file.name.split('.').pop()}`;
                            const url = await uploadImageToSupabase(file, path);
                            updateSticker(index, 'image', url);
                          } catch (err) {
                            const errorMsg = err instanceof Error ? err.message : String(err);
                            console.error(`Image upload failed (sticker ${index + 1}):`, err);
                            alert(`Sticker ${index + 1} image upload failed: ` + errorMsg);
                          }
                        }}
                        className="input-dark w-full text-sm"
                      />
                      {sticker.image && (
                        <div className="mt-2">
                          <img src={sticker.image} alt="Sticker" className="max-h-16 rounded" />
                        </div>
                      )}
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={sticker.price}
                        onChange={(e) => updateSticker(index, 'price', parseFloat(e.target.value) || 0)}
                        className="input-dark w-full text-sm"
                        placeholder="Price"
                      />
                      <input
                        type="url"
                        value={sticker.external_link}
                        onChange={(e) => updateSticker(index, 'external_link', e.target.value)}
                        className="input-dark w-full text-sm"
                        placeholder="External link to sticker"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !name.trim() || !skinId}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin-slow w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Saving...
                </div>
              ) : (
                isEditing ? 'Update Craft' : 'Create Craft'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 