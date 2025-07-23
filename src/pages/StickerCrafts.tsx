import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import SEO, { SEOPresets } from "../components/SEO";

interface StickerCraft {
  id: string;
  name: string;
  description: string;
  ingame_image?: string;
  placement_image?: string;
}

export default function StickerCrafts() {
  const [crafts, setCrafts] = useState<StickerCraft[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCrafts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("sticker_crafts")
        .select("id, name, description, ingame_image, placement_image")
        .order("created_at", { ascending: false });
      setCrafts(data || []);
      setLoading(false);
    };
    fetchCrafts();
  }, []);

  return (
    <>
      <SEO {...SEOPresets.stickerCrafts} />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-dark-text-primary mb-4">Sticker Crafts</h1>
          <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto">
            Discover unique sticker combinations and create your own custom designs. 
            Browse through our collection of expertly crafted sticker combinations.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="skeleton-card mb-4"></div>
                <div className="skeleton-text mb-2"></div>
                <div className="skeleton-text w-3/4"></div>
              </div>
            ))}
          </div>
        ) : crafts.length === 0 ? (
          <div className="text-center py-16">
            <div className="glass-card p-12 max-w-md mx-auto">
              <div className="text-dark-text-muted mb-6">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-dark-text-primary mb-2">No Sticker Crafts Yet</h3>
              <p className="text-dark-text-secondary">Be the first to create amazing sticker combinations!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {crafts.map(craft => {
              const previewImg = craft.ingame_image || craft.placement_image || "/placeholder.png";
              return (
                <button
                  key={craft.id}
                  onClick={() => navigate(`/sticker-crafts/${craft.id}`)}
                  className="glass-card p-6 card-hover group text-left w-full"
                >
                  <div className="relative mb-4">
                    <img
                      src={previewImg}
                      alt={craft.name}
                      className="w-full h-48 object-contain rounded-lg bg-dark-bg-tertiary/50 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg-primary/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-dark-text-primary group-hover:text-accent-primary transition-colors duration-200">
                      {craft.name}
                    </h3>
                    <p className="text-dark-text-secondary text-sm line-clamp-3">
                      {craft.description}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-dark-text-muted">
                        View Details
                      </span>
                      <svg className="w-4 h-4 text-dark-text-muted group-hover:text-accent-primary transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Stats Section */}
        {crafts.length > 0 && (
          <div className="mt-16">
            <div className="glass-card p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-accent-primary mb-2">{crafts.length}</div>
                  <div className="text-dark-text-secondary">Total Crafts</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent-secondary mb-2">
                    {crafts.filter(c => c.ingame_image).length}
                  </div>
                  <div className="text-dark-text-secondary">With In-Game Images</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent-success mb-2">
                    {crafts.filter(c => c.placement_image).length}
                  </div>
                  <div className="text-dark-text-secondary">With Placement Guides</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 