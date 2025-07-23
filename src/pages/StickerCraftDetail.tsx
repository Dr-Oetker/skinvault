import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import LoadingSkeleton from '../components/LoadingSkeleton';

interface StickerCraft {
  id: string;
  name: string;
  description: string;
  ingame_image?: string;
  placement_image?: string;
  skin_id?: string;
  external_craft_link?: string;
}

interface StickerEntry {
  id: string;
  name: string;
  image?: string;
  price?: number;
  external_link?: string;
  last_updated?: string;
}

export default function StickerCraftDetail() {
  const { id } = useParams();
  const [craft, setCraft] = useState<StickerCraft | null>(null);
  const [stickers, setStickers] = useState<StickerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedSkin, setRelatedSkin] = useState<{ id: string, name: string, wears_extended: any[] } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const { data: craftData, error: craftError } = await supabase
        .from("sticker_crafts")
        .select("id, name, description, ingame_image, placement_image, skin_id, external_craft_link")
        .eq("id", id)
        .single();
      if (craftError || !craftData) {
        setError("Sticker craft not found.");
        setLoading(false);
        return;
      }
      setCraft(craftData);
      const { data: stickerData } = await supabase
        .from("sticker_craft_stickers")
        .select("id, name, image, price, external_link, last_updated")
        .eq("craft_id", id)
        .order("position");
      setStickers(stickerData || []);
      // Fetch related skin details
      if (craftData?.skin_id) {
        const { data: skinData } = await supabase
          .from("skins")
          .select("id, name, wears_extended")
          .eq("id", craftData.skin_id)
          .single();
        setRelatedSkin(skinData || null);
      } else {
        setRelatedSkin(null);
      }
      setLoading(false);
    };
    if (id) fetchData();
  }, [id]);

  function getPriceRange(wears_extended: any[] | undefined) {
    if (!wears_extended || wears_extended.length === 0) return null;
    const enabledWears = wears_extended.filter((w: any) => w.enabled);
    if (enabledWears.length === 0) return null;
    const prices = enabledWears.map((w: any) => w.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `$${min}` : `$${min} - $${max}`;
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto py-8 px-2 sm:px-6">
      <div className="glass-card p-6 md:p-8 shadow-dark-lg border border-dark-border-primary/60 mb-8">
        <h1 className="text-3xl font-bold mb-2 text-dark-text-primary tracking-tight">Sticker Craft</h1>
        <LoadingSkeleton type="skeleton" lines={7} />
      </div>
    </div>
  );
  if (error || !craft) return (
    <div className="max-w-3xl mx-auto py-8 px-2 sm:px-6">
      <div className="glass-card p-6 md:p-8 shadow-dark-lg border border-dark-border-primary/60 mb-8">
        <h1 className="text-3xl font-bold mb-2 text-dark-text-primary tracking-tight">Sticker Craft</h1>
        <div className="py-16 text-accent-error text-lg text-center">{error || "Not found."}</div>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-2 sm:px-6">
      <div className="glass-card p-6 md:p-8 shadow-dark-lg border border-dark-border-primary/60 mb-8">
        <h1 className="text-3xl font-bold mb-2 text-dark-text-primary tracking-tight">{craft.name}</h1>
        <div className="text-dark-text-tertiary mb-4 text-base">{craft.description}</div>
        {/* Related Skin Name and Price Range */}
        {relatedSkin && (
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
            <Link
              to={`/skins/${relatedSkin.id}`}
              className="text-xl font-bold text-accent-primary hover:underline mr-2"
            >
              {relatedSkin.name}
            </Link>
            <div className="text-dark-text-muted text-lg font-medium">
              {getPriceRange(relatedSkin.wears_extended)}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {craft.ingame_image && (
            <img src={craft.ingame_image} alt="In-game" className="w-full rounded-xl border border-dark-border-primary/40 shadow object-contain bg-dark-bg-secondary" />
          )}
          {craft.placement_image && (
            <img src={craft.placement_image} alt="Placement" className="w-full rounded-xl border border-dark-border-primary/40 shadow object-contain bg-dark-bg-secondary" />
          )}
        </div>
        {craft.external_craft_link && (
          <a
            href={craft.external_craft_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-4 btn-secondary text-accent-primary border-accent-primary/40 hover:bg-accent-primary/10 text-sm px-4 py-2 rounded-lg font-semibold"
          >
            View on third-party site
          </a>
        )}
        <h2 className="text-xl font-bold mb-4 text-dark-text-primary mt-6">Stickers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stickers.length === 0 ? (
            <div className="text-dark-text-muted col-span-2 text-center">No stickers listed for this craft.</div>
          ) : (
            stickers.map(sticker => (
              <div key={sticker.id} className="glass-card border border-dark-border-primary/40 rounded-xl p-4 flex flex-col items-center shadow-md bg-dark-bg-secondary/80">
                {sticker.image && (
                  <img src={sticker.image} alt={sticker.name} className="w-20 h-20 object-contain mb-2 rounded bg-dark-bg-tertiary border border-dark-border-primary/30" />
                )}
                <div className="font-semibold mb-1 text-center text-dark-text-primary text-base">{sticker.name}</div>
                {sticker.price !== undefined && (
                  <div className="text-accent-success font-bold mb-1 text-lg">${sticker.price}</div>
                )}
                {sticker.external_link && (
                  <a
                    href={sticker.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-primary hover:underline text-xs mb-1 font-medium"
                  >
                    Sticker Link
                  </a>
                )}
                {sticker.last_updated && (
                  <div className="text-xs text-dark-text-tertiary">Last updated: {new Date(sticker.last_updated).toLocaleDateString()}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 