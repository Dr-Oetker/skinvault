import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../store/auth";
import { useFavorites } from "../store/favorites";
import ResellTrackerModal from '../components/ResellTrackerModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { scrollPositionManager } from '../utils/scrollPosition';
import { selectFrom, insertInto } from '../utils/supabaseApi';

interface WearEntry {
  wear: string;
  price: number;
  enabled: boolean;
  variant: 'normal' | 'stattrak' | 'souvenir';
}

interface Skin {
  id: string;
  name: string;
  image: string;
  description: string;
  wears_extended: WearEntry[];
  crates: any[];
  collections: any[];
  stattrak: boolean;
  souvenir: boolean;
  rarity_color: string;
  rarity: string;
  last_price_update?: string;
}

const wearColors: Record<string, string> = {
  FN: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  MW: "bg-green-500/20 text-green-300 border border-green-500/30",
  FT: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  WW: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  BS: "bg-red-500/20 text-red-300 border border-red-500/30",
};

function decodeHtmlEntities(str: string) {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

export default function SkinDetail() {
  const { skinId } = useParams();
  const { user } = useAuth();
  const { favoriteSkinIds, addFavorite, removeFavorite, loading: favoritesLoading } = useFavorites();
  const [skin, setSkin] = useState<Skin | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResellModal, setShowResellModal] = useState(false);
  const [buyPrice, setBuyPrice] = useState("");
  const [wearValue, setWearValue] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedWear, setSelectedWear] = useState("");
  const [boughtAt, setBoughtAt] = useState("");
  // Add state for image modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalUrl, setImageModalUrl] = useState<string|null>(null);
  const [imageModalScrollY, setImageModalScrollY] = useState<number | null>(null);

  // Add wear ranges and helper functions
  const wearRanges = {
    FN: { min: 0.00, max: 0.07, label: "Factory New (FN)" },
    MW: { min: 0.07, max: 0.15, label: "Minimal Wear (MW)" },
    FT: { min: 0.15, max: 0.38, label: "Field-Tested (FT)" },
    WW: { min: 0.38, max: 0.45, label: "Well-Worn (WW)" },
    BS: { min: 0.45, max: 1.00, label: "Battle-Scarred (BS)" }
  };

  const getWearFromFloat = (floatValue: number): string => {
    for (const [wear, range] of Object.entries(wearRanges)) {
      if (floatValue >= range.min && floatValue <= range.max) {
        return wear;
      }
    }
    return "";
  };

  const getPriceForWear = (wear: string, variant: 'normal' | 'stattrak' | 'souvenir' = 'normal'): number | null => {
    if (!skin?.wears_extended) return null;
    const wearEntry = skin.wears_extended.find(w => w.wear === wear && w.enabled && w.variant === variant);
    return wearEntry?.price || null;
  };

  const handleFloatChange = (value: string) => {
    setWearValue(value);
    if (value) {
      const float = parseFloat(value);
      if (!isNaN(float) && float >= 0 && float <= 1) {
        const detectedWear = getWearFromFloat(float);
        setSelectedWear(detectedWear);
      }
    }
  };

  const handleWearSelect = (wear: string) => {
    setSelectedWear(wear);
    setWearValue(""); // Clear float when wear is manually selected
  };

  const handleImageModalOpen = (imageUrl: string) => {
    setImageModalScrollY(window.scrollY);
    setShowImageModal(true);
    setImageModalUrl(imageUrl);
  };

  // Scroll to top when entering skin detail page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data } = await selectFrom("skins", {
        select: "id, name, image, description, wears_extended, crates, collections, stattrak, souvenir, rarity_color, rarity, last_price_update",
        eq: { id: skinId },
        single: true
      });
      setSkin(data || null);
      setLoading(false);
    };
    if (skinId) fetchData();
  }, [skinId]);

  const isFavorited = skin && favoriteSkinIds.includes(skin.id);
  
  const handleToggleFavorite = async () => {
    if (!user || !skin) return;
    
    if (isFavorited) {
      await removeFavorite(user.id, skin.id);
    } else {
      await addFavorite(user.id, skin.id);
    }
  };

  function renderDescription(desc: string) {
    if (!desc) return null;
    // Decode HTML entities
    let html = decodeHtmlEntities(desc);
    // Normalize all newlines to \n
    html = html.replace(/\r\n|\r/g, '\n');
    // Replace all double newlines (\n\n, \n\n, \n\n, etc) with a unique marker
    html = html.replace(/(\\n\\n|\\n\n|\n\\n|\n\n|\n\n)/g, '[[PARA]]');
    // Split by marker into paragraphs
    const paragraphs = html.split('[[PARA]]').map(p =>
      `<p>${p.replace(/(\\n|\n)/g, '<br />')}</p>`
    );
    return <span dangerouslySetInnerHTML={{ __html: paragraphs.join('') }} />;
  }

  function getWearBadges(wears_extended: WearEntry[] | null | undefined) {
    if (!wears_extended) return null;
    const order = ["FN", "MW", "FT", "WW", "BS"];
    const variants: ('normal' | 'stattrak' | 'souvenir')[] = ['normal', 'stattrak', 'souvenir'];
    const variantColors = {
      normal: 'text-dark-text-primary',
      stattrak: 'text-orange-400',
      souvenir: 'text-yellow-400'
    };
    const variantLabels = {
      normal: '',
      stattrak: 'ST',
      souvenir: 'SV'
    };

    return (
      <div className="space-y-4 mb-1">
        {order.map(wear => {
          const wearVariants = variants.map(variant => {
            const entry = wears_extended.find(w => w.wear === wear && w.enabled && w.variant === variant);
            return { variant, entry };
          }).filter(v => v.entry);

          if (wearVariants.length === 0) return null;

          return (
            <div key={wear} className="flex flex-col gap-2">
              <div className="text-sm font-medium text-dark-text-secondary">{wear}</div>
              <div className="flex flex-wrap gap-2">
                {wearVariants.map(({ variant, entry }) => (
                  <span
                    key={`${wear}-${variant}`}
                    className={`px-3 py-1.5 rounded text-sm font-medium shadow-sm border ${wearColors[wear] || "bg-dark-bg-secondary text-dark-text-primary border-dark-border"} ${variantColors[variant]}`}
                  >
                    {variantLabels[variant] && <span className="mr-1">{variantLabels[variant]}</span>}
                    {entry!.price === 0 ? 'No Data' : `$${entry!.price}`}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleString();
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto py-8 px-2 sm:px-6">
      <div className="glass-card p-6 md:p-8 shadow-dark-lg border border-dark-border-primary/60 mb-8">
        <h1 className="text-3xl font-bold mb-2 text-dark-text-primary tracking-tight">Skin Details</h1>
        <LoadingSkeleton type="skeleton" lines={8} />
      </div>
    </div>
  );
  if (!skin) return (
    <div className="max-w-2xl mx-auto py-8 px-2 sm:px-6">
      <div className="glass-card p-6 md:p-8 shadow-dark-lg border border-dark-border-primary/60 mb-8">
        <h1 className="text-3xl font-bold mb-2 text-dark-text-primary tracking-tight">Skin Details</h1>
        <div className="py-16 text-accent-error text-lg text-center">Skin not found.</div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-8 px-2 sm:px-6">
      <div className="glass-card p-6 md:p-8 shadow-dark-lg border border-dark-border-primary/60 mb-8">
      <div className="flex flex-col md:flex-row gap-8 items-center mb-6">
          <div className="relative w-64 h-64">
            <img src={skin.image} alt={skin.name} className="w-64 h-64 object-contain rounded-xl border border-dark-border-primary/40 shadow bg-dark-bg-secondary" />
            <span 
              role="button" 
              tabIndex={0} 
              onClick={() => handleImageModalOpen(skin.image)}
              className="absolute bottom-2 right-2 bg-black/60 rounded-full p-2 hover:bg-black/80 focus:outline-none cursor-pointer transition-colors" 
              title="Enlarge image"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleImageModalOpen(skin.image); } }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </span>
          </div>
          <div className="flex-1 w-full">
            <h1 className="text-3xl font-bold mb-2 text-dark-text-primary tracking-tight">{skin.name}</h1>
            <div className="mb-2 text-dark-text-tertiary text-base">{renderDescription(skin.description)}</div>
            <div className="flex gap-2 mb-2 flex-wrap">
            {skin.stattrak && <span className="px-2 py-0.5 bg-accent-primary/20 text-accent-primary rounded text-xs font-medium">StatTrak</span>}
            {skin.souvenir && <span className="px-2 py-0.5 bg-accent-secondary/20 text-accent-secondary rounded text-xs font-medium">Souvenir</span>}
            <span className="px-2 py-0.5 rounded text-xs font-medium text-white" style={{ background: skin.rarity_color }}>{skin.rarity}</span>
          </div>
          <div className="mb-1">
            {getWearBadges(skin.wears_extended) || <span className="text-dark-text-muted">No prices</span>}
          </div>
          {skin.last_price_update && (
            <div className="text-xs text-dark-text-muted mb-2">
              Last price update: {formatDate(skin.last_price_update)}
            </div>
          )}
          {/* Favorite toggle and Resell Tracker button */}
            <div className="flex gap-3 mt-4 flex-wrap">
              <button 
                onClick={handleToggleFavorite}
                disabled={favoritesLoading}
                className={`btn-secondary px-4 py-2 rounded-lg font-semibold text-sm border ${isFavorited ? 'bg-accent-primary/20 text-accent-primary border-accent-primary/40' : 'text-dark-text-primary border-dark-border-primary/40 hover:bg-accent-primary/10'} transition`}
                title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorited ? '♥ Favorited' : '♡ Favorite'}
              </button>
              <button
                onClick={() => setShowResellModal(true)}
                className="btn-secondary px-4 py-2 rounded-lg font-semibold text-sm text-accent-primary border-accent-primary/40 hover:bg-accent-primary/10"
              >
                Track Resell
              </button>
            </div>
          </div>
        </div>
        {/* Crates and Collections */}
        <div className="flex flex-wrap gap-4 mb-4">
          {skin.crates && skin.crates.length > 0 && (
            <div className="bg-dark-bg-tertiary/80 rounded-lg px-4 py-2 text-dark-text-tertiary text-sm font-medium border border-dark-border-primary/30">
              <span className="font-semibold">Crates:</span> {skin.crates.map((c: any) => c.name).join(", ")}
            </div>
          )}
          {skin.collections && skin.collections.length > 0 && (
            <div className="bg-dark-bg-tertiary/80 rounded-lg px-4 py-2 text-dark-text-tertiary text-sm font-medium border border-dark-border-primary/30">
              <span className="font-semibold">Collections:</span> {skin.collections.map((c: any) => c.name).join(", ")}
            </div>
          )}
        </div>
        {/* Resell Tracker Modal */}
        {showResellModal && (
        <ResellTrackerModal
          open={showResellModal}
          onClose={() => {
            setShowResellModal(false);
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
              const { error } = await insertInto("resell_tracker", {
                      user_id: user?.id,
                      skin_id: skin?.id,
                    buy_price: price,
                    wear_value: floatValue,
                    wear: formData.wear,
                    notes: formData.notes.trim() || null,
                    bought_at: formData.bought_at,
                  });
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
              }
              setSaving(false);
            } catch (e) {
              setErrorMsg("An error occurred. Please try again.");
              setSaving(false);
            }
          }}
          skin={skin}
          initialData={{
            buy_price: buyPrice,
            wear_value: wearValue,
            wear: selectedWear,
            notes: notes,
              bought_at: boughtAt
          }}
          mode="add"
          loading={saving}
          errorMsg={errorMsg}
          successMsg={successMsg}
          floatInputFullWidth={true}
        />
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
            <button 
              onClick={() => setShowImageModal(false)} 
              className="absolute top-2 right-2 text-white text-2xl bg-black/60 rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80 focus:outline-none" 
              title="Close"
            >
              &times;
            </button>
            <img src={imageModalUrl} alt="Enlarged skin" className="w-full h-auto max-h-[80vh] rounded shadow-lg mx-auto" />
          </div>
        </div>
      )}
      </div>
    </div>
  );
} 