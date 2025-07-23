import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import SEO, { SEOPresets } from '../components/SEO';
import LoadingSkeleton from '../components/LoadingSkeleton';

interface Weapon {
  id: string;
  name: string;
  category: string;
  image?: string;
  skinCount?: number;
  hasSkins?: boolean;
}

interface Category {
  id: string;
  name: string;
}

export default function Category() {
  const { categoryName } = useParams();
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch category info
      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .eq("name", categoryName)
        .single();
      
      setCategory(catData);

      // Fetch weapons for this category
      const { data: weaponsData } = await supabase
        .from("weapons")
        .select("id, name, category")
        .eq("category", categoryName)
        .order("name");

      if (weaponsData) {
        // For each weapon, get the first skin image and count all skins
        const weaponsWithImages = await Promise.all(
          weaponsData.map(async (weapon) => {
            // Get first skin image
            const { data: firstSkinData } = await supabase
              .from("skins")
              .select("id, image")
              .eq("weapon", weapon.name)
              .limit(1);
            
            // Get total count of skins for this weapon
            const { count: skinCount } = await supabase
              .from("skins")
              .select("*", { count: 'exact', head: true })
              .eq("weapon", weapon.name);
            
            // Create a clean weapon name for fallback image
            const cleanWeaponName = weapon.name.replace(/[^a-zA-Z0-9]/g, '');
            const fallbackImage = `/src/assets/images/standard_weapons/${cleanWeaponName}.webp`;
            
            return {
              ...weapon,
              image: firstSkinData?.[0]?.image || fallbackImage,
              skinCount: skinCount || 0,
              hasSkins: (skinCount || 0) > 0
            };
          })
        );
        
        setWeapons(weaponsWithImages);
      }
      
      setLoading(false);
    };

    if (categoryName) {
      fetchData();
    }
  }, [categoryName]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <LoadingSkeleton type="page" />
        <LoadingSkeleton type="card" cards={18} />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold text-dark-text-primary mb-4">Category Not Found</h1>
          <p className="text-dark-text-secondary">The requested category could not be found.</p>
          <Link to="/" className="btn-primary mt-6">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        {...SEOPresets.category(category.name)}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": `${category.name} Weapons`,
          "description": `Browse ${category.name} weapons and their skins for CS 2`,
          "url": `https://skinvault.app/category/${encodeURIComponent(category.name)}`,
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": weapons.map((weapon, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Product",
                "name": `${weapon.name} Skins`,
                "description": `${weapon.name} skins for CS 2`,
                "category": category.name,
                "brand": {
                  "@type": "Brand",
                  "name": "Counter-Strike 2"
                }
              }
            }))
          }
        }}
      />
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-dark-text-primary tracking-tight">
              {category.name}
            </h1>
                         <span className="text-lg text-dark-text-muted">
               {weapons.length} Weapons
             </span>
          </div>
          <button className="p-2 rounded-full hover:bg-dark-bg-tertiary/50 transition-colors duration-200">
            <svg className="w-5 h-5 text-dark-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Weapons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
          {weapons.map(weapon => (
            <Link 
              key={weapon.id} 
              to={`/weapons/${encodeURIComponent(weapon.name)}`}
              className="block group"
            >
              <div className="glass-card rounded-2xl p-6 h-48 flex flex-col items-center justify-center hover:scale-105 hover:shadow-dark-lg transition-all duration-200 border border-dark-border-primary/60">
                <div className="w-20 h-20 mb-4 rounded-xl border border-dark-border-primary/60 bg-dark-bg-tertiary flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img 
                    src={weapon.image} 
                    alt={weapon.name} 
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      // Show the placeholder icon
                      const placeholder = target.parentElement?.querySelector('.placeholder-icon');
                      if (placeholder) {
                        placeholder.classList.remove('hidden');
                      }
                    }}
                  />
                  <div className="placeholder-icon w-full h-full flex items-center justify-center hidden">
                    <svg className="w-8 h-8 text-dark-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <div className="text-center flex-1 flex flex-col justify-center min-w-0">
                  <h3 className="font-bold text-base text-dark-text-primary mb-1 leading-tight">
                    {weapon.name} Skins
                  </h3>
                  <p className="text-sm text-dark-text-muted">
                    {weapon.skinCount} Items
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {weapons.length === 0 && (
          <div className="text-center py-16">
            <p className="text-dark-text-muted text-lg">No weapons found in this category.</p>
          </div>
        )}
      </div>
    </>
  );
} 