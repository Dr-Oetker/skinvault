import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { selectFrom } from "../utils/supabaseApi";

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
  weapon: string;
  rarity: string;
  rarity_color: string;
  wears_extended: WearEntry[];
  collections: any[];
}

interface CollectionData {
  name: string;
  skins: Skin[];
}

interface TradeUpOpportunity {
  collectionName: string;
  wear: string;
  lowerRarity: string;
  higherRarity: string;
  lowerRaritySkin: Skin;
  higherRaritySkin: Skin;
  lowerRarityPrice: number;
  higherRarityPrice: number;
  combinedPrice: number;
  profit: number;
  profitPercent: number;
  totalHigherRaritySkins: number;
  profitableHigherRaritySkins: number;
  hitProbability: number;
  expectedProfit: number;
}

// Rarity order for sorting (higher index = higher rarity)
const rarityOrder = {
  'Consumer Grade': 0,
  'Industrial Grade': 1,
  'Mil-Spec': 2,
  'Mil-Spec Grade': 2,
  'Restricted': 3,
  'Classified': 4,
  'Covert': 5,
  'Extraordinary': 6,
};

const wearOrder = ['FN', 'MW', 'FT', 'WW', 'BS'];

// Helper function to get next rarity in the hierarchy
const getNextRarity = (currentRarity: string): string | null => {
  const rarityHierarchy = ['Consumer Grade', 'Industrial Grade', 'Mil-Spec', 'Mil-Spec Grade', 'Restricted', 'Classified', 'Covert'];
  const currentIndex = rarityHierarchy.indexOf(currentRarity);
  
  if (currentIndex === -1 || currentIndex >= rarityHierarchy.length - 1) return null;
  
  // Skip duplicate Mil-Spec entries
  if (rarityHierarchy[currentIndex + 1] === 'Mil-Spec Grade' && currentRarity === 'Mil-Spec') {
    return currentIndex + 2 < rarityHierarchy.length ? rarityHierarchy[currentIndex + 2] : null;
  }
  if (rarityHierarchy[currentIndex + 1] === 'Mil-Spec' && currentRarity === 'Mil-Spec Grade') {
    return currentIndex + 2 < rarityHierarchy.length ? rarityHierarchy[currentIndex + 2] : null;
  }
  
  return rarityHierarchy[currentIndex + 1];
};

// Calculate trade-up opportunities across collections
const calculateTradeUpOpportunities = (collections: CollectionData[]): TradeUpOpportunity[] => {
  const opportunities: TradeUpOpportunity[] = [];

  collections.forEach(collection => {
    // Group skins by rarity
    const skinsByRarity = new Map<string, Skin[]>();
    collection.skins.forEach(skin => {
      if (!skinsByRarity.has(skin.rarity)) {
        skinsByRarity.set(skin.rarity, []);
      }
      skinsByRarity.get(skin.rarity)!.push(skin);
    });

    // For each rarity, check if 10x lower rarity is cheaper than 1x next rarity
    skinsByRarity.forEach((skins, rarity) => {
      const nextRarity = getNextRarity(rarity);
      if (!nextRarity) return;

      const higherRaritySkins = skinsByRarity.get(nextRarity);
      if (!higherRaritySkins || higherRaritySkins.length === 0) return;

      // Check each wear grade
      wearOrder.forEach(wear => {
        // Find cheapest skin in current rarity for this wear
        let cheapestLowerSkin: Skin | null = null;
        let cheapestLowerPrice = Infinity;

        skins.forEach(skin => {
          if (!skin.wears_extended) return;
          const wearEntry = skin.wears_extended.find(w => w.wear === wear && w.enabled && w.variant === 'normal');
          if (wearEntry && wearEntry.price > 0 && wearEntry.price < cheapestLowerPrice) {
            cheapestLowerPrice = wearEntry.price;
            cheapestLowerSkin = skin;
          }
        });

        if (!cheapestLowerSkin || cheapestLowerPrice === Infinity) return;

        // Calculate if 10x lower is cheaper than 1x higher
        const combinedPrice = cheapestLowerPrice * 10;
        
        // Count total higher rarity skins in the collection (regardless of wear availability)
        const totalHigherRaritySkins = higherRaritySkins.length;

        if (totalHigherRaritySkins === 0) return;

        // For each higher rarity skin, determine if it would be profitable
        // If the skin doesn't exist in the target wear, it drops to the next available wear
        let profitableOutcomes = 0;
        let totalExpectedProfit = 0;

        higherRaritySkins.forEach(skin => {
          if (!skin.wears_extended) return;
          
          // Find the actual price this skin would have in the trade-up
          // Start with target wear, then fall back to next available wear if not found
          const targetWearEntry = skin.wears_extended.find(w => w.wear === wear && w.enabled && w.variant === 'normal' && w.price > 0);
          
          let actualPrice = 0;
          let actualWear = wear;
          
          if (targetWearEntry) {
            // Skin exists in target wear
            actualPrice = targetWearEntry.price;
          } else {
            // Skin doesn't exist in target wear, find next available wear
            const wearOrder = ['fn', 'mw', 'ft', 'ww', 'bs'];
            const currentWearIndex = wearOrder.indexOf(wear);
            
            for (let i = currentWearIndex + 1; i < wearOrder.length; i++) {
              const fallbackWear = wearOrder[i];
              const fallbackEntry = skin.wears_extended.find(w => w.wear === fallbackWear && w.enabled && w.variant === 'normal' && w.price > 0);
              if (fallbackEntry) {
                actualPrice = fallbackEntry.price;
                actualWear = fallbackWear;
                break;
              }
            }
          }

          // Check if this outcome would be profitable
          if (actualPrice > combinedPrice) {
            profitableOutcomes++;
            totalExpectedProfit += actualPrice - combinedPrice;
          }
        });

        // Only show if there's at least one profitable outcome
        if (profitableOutcomes === 0) return;

        // Find a representative higher rarity skin for display (first profitable one)
        let representativeHigherSkin: Skin | null = null;
        let representativeHigherPrice = 0;

        higherRaritySkins.forEach(skin => {
          if (representativeHigherSkin) return; // Already found one
          if (!skin.wears_extended) return;
          
          // Find the actual price this skin would have in the trade-up
          const targetWearEntry = skin.wears_extended.find(w => w.wear === wear && w.enabled && w.variant === 'normal' && w.price > 0);
          
          let actualPrice = 0;
          
          if (targetWearEntry) {
            actualPrice = targetWearEntry.price;
          } else {
            // Find next available wear
            const wearOrder = ['fn', 'mw', 'ft', 'ww', 'bs'];
            const currentWearIndex = wearOrder.indexOf(wear);
            
            for (let i = currentWearIndex + 1; i < wearOrder.length; i++) {
              const fallbackWear = wearOrder[i];
              const fallbackEntry = skin.wears_extended.find(w => w.wear === fallbackWear && w.enabled && w.variant === 'normal' && w.price > 0);
              if (fallbackEntry) {
                actualPrice = fallbackEntry.price;
                break;
              }
            }
          }

          // Use this skin if it would be profitable
          if (actualPrice > combinedPrice) {
            representativeHigherSkin = skin;
            representativeHigherPrice = actualPrice;
          }
        });

        if (!representativeHigherSkin) return;

        const profit = representativeHigherPrice - combinedPrice;
        const profitPercent = (profit / combinedPrice) * 100;
        const hitProbability = (profitableOutcomes / totalHigherRaritySkins) * 100;
        const expectedProfit = totalExpectedProfit / totalHigherRaritySkins;

        opportunities.push({
          collectionName: collection.name,
          wear,
          lowerRarity: rarity,
          higherRarity: nextRarity,
          lowerRaritySkin: cheapestLowerSkin,
          higherRaritySkin: representativeHigherSkin,
          lowerRarityPrice: cheapestLowerPrice,
          higherRarityPrice: representativeHigherPrice,
          combinedPrice,
          profit,
          profitPercent,
          totalHigherRaritySkins,
          profitableHigherRaritySkins: profitableOutcomes,
          hitProbability,
          expectedProfit
        });
      });
    });
  });

  // Sort by expected profit (highest first), then by hit probability
  return opportunities.sort((a, b) => {
    if (b.expectedProfit !== a.expectedProfit) {
      return b.expectedProfit - a.expectedProfit;
    }
    return b.hitProbability - a.hitProbability;
  });
};

export default function SkinTable() {
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<CollectionData[]>([]);
  const [tradeUpOpportunities, setTradeUpOpportunities] = useState<TradeUpOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collectionFilter, setCollectionFilter] = useState<string>("");

  useEffect(() => {
    const fetchSkins = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all skins using REST API
        const { data: allSkinsData, error: skinsError } = await selectFrom("skins", {
          select: "id, name, image, weapon, rarity, rarity_color, wears_extended, collections"
        });
        
        // Filter out gloves and knives in JavaScript
        const excludePatterns = ['glove', 'knife', 'bayonet', 'karambit', 'butterfly', 'flip', 'gut', 'huntsman', 'falchion', 'shadow', 'bowie', 'navaja', 'stiletto', 'talon', 'ursus', 'classic'];
        const skinsData = allSkinsData?.filter((skin: any) => 
          !excludePatterns.some(pattern => skin.weapon.toLowerCase().includes(pattern))
        );

        if (skinsError) {
          throw skinsError;
        }

        if (!skinsData) {
          throw new Error("No skins data received");
        }

        // Debug: Log unique rarities found
        const uniqueRarities = [...new Set(skinsData.map((skin: any) => skin.rarity))];
        console.log("Unique rarities found:", uniqueRarities);
        console.log("Total skins loaded:", skinsData.length);

        // Group skins by collection and rarity
        const collectionsMap = new Map<string, Map<string, Skin[]>>();

        skinsData.forEach((skin: any) => {
          // Extract collection names from the collections array
          if (skin.collections && Array.isArray(skin.collections) && skin.collections.length > 0) {
            skin.collections.forEach((collection: any) => {
              const collectionName = collection.name || collection;
              if (collectionName) {
                if (!collectionsMap.has(collectionName)) {
                  collectionsMap.set(collectionName, new Map());
                }
                
                const rarityMap = collectionsMap.get(collectionName)!;
                if (!rarityMap.has(skin.rarity)) {
                  rarityMap.set(skin.rarity, []);
                }
                
                rarityMap.get(skin.rarity)!.push(skin);
              }
            });
          } else {
            // If no collections, add to a default "Other" collection
            const defaultCollectionName = "Other";
            if (!collectionsMap.has(defaultCollectionName)) {
              collectionsMap.set(defaultCollectionName, new Map());
            }
            
            const rarityMap = collectionsMap.get(defaultCollectionName)!;
            if (!rarityMap.has(skin.rarity)) {
              rarityMap.set(skin.rarity, []);
            }
            
            rarityMap.get(skin.rarity)!.push(skin);
          }
        });

        // Convert to array format and sort
        const collectionsArray: CollectionData[] = Array.from(collectionsMap.entries())
          .map(([collectionName, rarityMap]) => {
            // Get all skins from this collection
            const allSkins: Skin[] = [];
            rarityMap.forEach(skins => {
              allSkins.push(...skins);
            });

            // Sort skins by rarity (lowest to highest as shown in screenshot)
            const sortedSkins = allSkins.sort((a, b) => {
              const aOrder = rarityOrder[a.rarity as keyof typeof rarityOrder] ?? 999;
              const bOrder = rarityOrder[b.rarity as keyof typeof rarityOrder] ?? 999;
              return aOrder - bOrder;
            });

            return {
              name: collectionName,
              skins: sortedSkins
            };
          })
          .sort((a, b) => {
            // Sort collections by the lowest rarity they contain (Consumer Grade first)
            const aMinRarity = Math.min(...a.skins.map(s => rarityOrder[s.rarity as keyof typeof rarityOrder] ?? 999));
            const bMinRarity = Math.min(...b.skins.map(s => rarityOrder[s.rarity as keyof typeof rarityOrder] ?? 999));
            return aMinRarity - bMinRarity;
          });

        setCollections(collectionsArray);
        setFilteredCollections(collectionsArray);

        // Calculate trade-up opportunities
        const opportunities = calculateTradeUpOpportunities(collectionsArray);
        setTradeUpOpportunities(opportunities);
      } catch (err) {
        console.error("Error fetching skins:", err);
        setError(err instanceof Error ? err.message : "Failed to load skins");
      } finally {
        setLoading(false);
      }
    };

    fetchSkins();
  }, []);

  // Filter collections based on selected collection
  useEffect(() => {
    if (collectionFilter) {
      const filtered = collections.filter(collection =>
        collection.name === collectionFilter
      );
      setFilteredCollections(filtered);
    } else {
      setFilteredCollections(collections);
    }
  }, [collections, collectionFilter]);

  const getPriceForWear = (skin: Skin, wear: string): number | null => {
    if (!skin.wears_extended) return null;
    const wearEntry = skin.wears_extended.find(w => w.wear === wear && w.enabled && w.variant === 'normal');
    return wearEntry?.price || null;
  };

  const getHighestPrice = (skin: Skin): number => {
    if (!skin.wears_extended) return 0;
    const enabled = skin.wears_extended.filter(w => w.enabled && w.variant === 'normal' && w.price > 0);
    if (enabled.length === 0) return 0;
    return Math.max(...enabled.map(w => w.price));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gradient mb-2">Skin Table</h1>
          <p className="text-dark-text-muted">Browse all weapon skins organized by collections</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <LoadingSkeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-accent-error text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-dark-text-primary mb-2">Error Loading Skins</h2>
        <p className="text-dark-text-muted mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gradient mb-2">Skin Table</h1>
        <p className="text-dark-text-muted text-sm">Browse weapon skins organized by collections</p>
      </div>

      {/* Trade-Up Opportunities Section */}
      {tradeUpOpportunities.length > 0 && (
        <div className="glass-card p-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gradient mb-1">💰 Trade-Up Opportunities</h2>
            <p className="text-dark-text-muted text-xs">
              Profitable trade-up contracts sorted by expected profit
            </p>
          </div>

          <div className="space-y-2">
            {tradeUpOpportunities.map((opportunity, index) => (
              <div 
                key={`${opportunity.collectionName}-${opportunity.wear}-${opportunity.lowerRarity}`}
                className="bg-dark-bg-tertiary/50 rounded-lg p-3 border border-dark-border-primary/60 hover:bg-dark-bg-tertiary/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-white text-sm">
                    #{index + 1}
                  </div>

                  {/* Opportunity Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-dark-text-primary truncate">
                        {opportunity.collectionName}
                      </h3>
                      <span className="px-1.5 py-0.5 bg-dark-bg-primary rounded text-xs font-medium text-dark-text-secondary flex-shrink-0">
                        {opportunity.wear}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <img 
                          src={opportunity.lowerRaritySkin.image} 
                          alt={opportunity.lowerRaritySkin.name}
                          className="w-6 h-6 object-contain rounded"
                        />
                        <div className="flex flex-col">
                          <span className="text-dark-text-primary font-medium truncate max-w-24">
                            {opportunity.lowerRaritySkin.name.replace(/^.*\|\s+/, '')}
                          </span>
                          <span 
                            className="text-xs font-medium truncate max-w-24"
                            style={{ color: opportunity.lowerRaritySkin.rarity_color }}
                          >
                            {opportunity.lowerRarity}
                          </span>
                          <span className="text-dark-text-muted text-xs">
                            10× ${opportunity.lowerRarityPrice}
                          </span>
                          <span className="text-dark-text-primary font-bold text-sm">
                            ${opportunity.combinedPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <span className="text-dark-text-muted">→</span>

                      <div className="flex items-center gap-1.5">
                        <img 
                          src={opportunity.higherRaritySkin.image} 
                          alt={opportunity.higherRaritySkin.name}
                          className="w-6 h-6 object-contain rounded"
                        />
                        <div className="flex flex-col">
                          <span className="text-dark-text-primary font-medium truncate max-w-24">
                            {opportunity.higherRaritySkin.name.replace(/^.*\|\s+/, '')}
                          </span>
                          <span 
                            className="text-xs font-medium truncate max-w-24"
                            style={{ color: opportunity.higherRaritySkin.rarity_color }}
                          >
                            {opportunity.higherRarity}
                          </span>
                          <span className="text-dark-text-muted text-xs">
                            ${opportunity.higherRarityPrice.toFixed(2)}
                          </span>
                          <span className="text-dark-text-primary font-bold text-sm">
                            ${opportunity.higherRarityPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-accent-success">
                        +${opportunity.profit.toFixed(2)}
                      </div>
                      <div className="text-xs text-dark-text-muted">
                        {opportunity.profitPercent.toFixed(0)}% profit
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-accent-primary">
                        {opportunity.hitProbability.toFixed(0)}%
                      </div>
                      <div className="text-xs text-dark-text-muted">
                        {opportunity.profitableHigherRaritySkins}/{opportunity.totalHigherRaritySkins} hit
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-accent-warning">
                        ${opportunity.expectedProfit.toFixed(2)}
                      </div>
                      <div className="text-xs text-dark-text-muted">
                        expected
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 text-center text-xs text-dark-text-muted">
            Showing {tradeUpOpportunities.length} opportunities
          </div>
        </div>
      )}

      {/* Filter Options */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
              Select Collection
            </label>
            <select
              value={collectionFilter}
              onChange={(e) => setCollectionFilter(e.target.value)}
              className="input-dark w-full"
            >
              <option value="">All Collections</option>
              {collections.map((collection) => (
                <option key={collection.name} value={collection.name}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>
          
          {collectionFilter && (
            <div>
              <button
                onClick={() => setCollectionFilter("")}
                className="btn-secondary text-sm px-4 py-2"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>
        
        {/* Filter Results Count */}
        {collectionFilter && (
          <div className="mt-3 text-sm text-dark-text-muted">
            Showing collection: <span className="font-semibold text-dark-text-primary">{collectionFilter}</span>
          </div>
        )}
      </div>

      {/* Collections */}
      <div className="space-y-6">
        {filteredCollections.map((collection, index) => (
          <div key={collection.name} className="glass-card p-4">
            <h2 className="text-xl font-bold text-dark-text-primary mb-4 text-center">
              {collection.name}
            </h2>
            
            {/* Rarity Sections */}
            <div className="space-y-6">
              {/* Consumer Grade Section */}
              {(() => {
                const consumerGradeSkins = collection.skins.filter(skin => 
                  skin.rarity === 'Consumer Grade' || skin.rarity === 'consumer' || skin.rarity === 'Consumer'
                );
                if (consumerGradeSkins.length > 0) {
                  return (
                    <div className="border border-dark-border-primary/60 rounded-lg">
                      {/* Rarity Header */}
                      <div className="bg-dark-bg-tertiary/50 px-4 py-2 border-b border-dark-border-primary/30">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-dark-border-primary" style={{ backgroundColor: consumerGradeSkins[0]?.rarity_color }}></div>
                          <span className="font-semibold text-dark-text-primary">Consumer Grade</span>
                        </div>
                      </div>
                      
                      {/* Skins Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-dark-border-primary/30">
                              {consumerGradeSkins.map((skin) => (
                                <th key={skin.id} className="text-center py-2 px-2 font-semibold text-dark-text-secondary border-r border-dark-border-primary/30 last:border-r-0">
                                  <div className="flex flex-col items-center gap-1">
                                    <img 
                                      src={skin.image} 
                                      alt={skin.name}
                                      className="w-6 h-6 object-contain rounded"
                                    />
                                    <div 
                                      className="text-sm font-medium px-2 py-1 rounded text-center"
                                      style={{ 
                                        color: skin.rarity_color,
                                        backgroundColor: `${skin.rarity_color}20`,
                                        border: `1px solid ${skin.rarity_color}40`,
                                        minWidth: '120px'
                                      }}
                                    >
                                      {skin.name.replace(/^.*\|\s+/, '')}
                                    </div>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {/* FN Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {consumerGradeSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'FN');
                                return (
                                  <td key={`${skin.id}-FN`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">FN</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* MW Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {consumerGradeSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'MW');
                                return (
                                  <td key={`${skin.id}-MW`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">MW</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* FT Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {consumerGradeSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'FT');
                                return (
                                  <td key={`${skin.id}-FT`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">FT</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* WW Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {consumerGradeSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'WW');
                                return (
                                  <td key={`${skin.id}-WW`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">WW</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* BS Row */}
                            <tr>
                              {consumerGradeSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'BS');
                                return (
                                  <td key={`${skin.id}-BS`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">BS</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Industrial Grade Section */}
              {(() => {
                const industrialGradeSkins = collection.skins.filter(skin => 
                  skin.rarity === 'Industrial Grade' || skin.rarity === 'industrial' || skin.rarity === 'Industrial'
                );
                if (industrialGradeSkins.length > 0) {
                  return (
                    <div className="border border-dark-border-primary/60 rounded-lg">
                      {/* Rarity Header */}
                      <div className="bg-dark-bg-tertiary/50 px-4 py-2 border-b border-dark-border-primary/30">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-dark-border-primary" style={{ backgroundColor: industrialGradeSkins[0]?.rarity_color }}></div>
                          <span className="font-semibold text-dark-text-primary">Industrial Grade</span>
                        </div>
                      </div>
                      
                      {/* Skins Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-dark-border-primary/30">
                              {industrialGradeSkins.map((skin) => (
                                <th key={skin.id} className="text-center py-2 px-2 font-semibold text-dark-text-secondary border-r border-dark-border-primary/30 last:border-r-0">
                                  <div className="flex flex-col items-center gap-1">
                                    <img 
                                      src={skin.image} 
                                      alt={skin.name}
                                      className="w-6 h-6 object-contain rounded"
                                    />
                                    <div 
                                      className="text-sm font-medium px-2 py-1 rounded text-center"
                                      style={{ 
                                        color: skin.rarity_color,
                                        backgroundColor: `${skin.rarity_color}20`,
                                        border: `1px solid ${skin.rarity_color}40`,
                                        minWidth: '120px'
                                      }}
                                    >
                                      {skin.name.replace(/^.*\|\s+/, '')}
                                    </div>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {/* FN Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {industrialGradeSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'FN');
                                return (
                                  <td key={`${skin.id}-FN`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">FN</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* MW Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {industrialGradeSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'MW');
                                return (
                                  <td key={`${skin.id}-MW`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">MW</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* FT Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {industrialGradeSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'FT');
                                return (
                                  <td key={`${skin.id}-FT`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">FT</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* WW Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {industrialGradeSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'WW');
                                return (
                                  <td key={`${skin.id}-WW`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">WW</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* BS Row */}
                            <tr>
                              {industrialGradeSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'BS');
                                return (
                                  <td key={`${skin.id}-BS`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">BS</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Mil-Spec Section */}
              {(() => {
                const milSpecSkins = collection.skins.filter(skin => 
                  skin.rarity === 'Mil-Spec' || skin.rarity === 'Mil-Spec Grade' || skin.rarity === 'mil-spec' || skin.rarity === 'MilSpec' || skin.rarity === 'milspec'
                );
                if (milSpecSkins.length > 0) {
                  return (
                    <div className="border border-dark-border-primary/60 rounded-lg">
                      {/* Rarity Header */}
                      <div className="bg-dark-bg-tertiary/50 px-4 py-2 border-b border-dark-border-primary/30">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-dark-border-primary" style={{ backgroundColor: milSpecSkins[0]?.rarity_color }}></div>
                          <span className="font-semibold text-dark-text-primary">Mil-Spec</span>
                        </div>
                      </div>
                      
                      {/* Skins Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-dark-border-primary/30">
                              {milSpecSkins.map((skin) => (
                                <th key={skin.id} className="text-center py-2 px-2 font-semibold text-dark-text-secondary border-r border-dark-border-primary/30 last:border-r-0">
                                  <div className="flex flex-col items-center gap-1">
                                    <img 
                                      src={skin.image} 
                                      alt={skin.name}
                                      className="w-6 h-6 object-contain rounded"
                                    />
                                    <div 
                                      className="text-sm font-medium px-2 py-1 rounded text-center"
                                      style={{ 
                                        color: skin.rarity_color,
                                        backgroundColor: `${skin.rarity_color}20`,
                                        border: `1px solid ${skin.rarity_color}40`,
                                        minWidth: '120px'
                                      }}
                                    >
                                      {skin.name.replace(/^.*\|\s+/, '')}
                                    </div>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {/* FN Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {milSpecSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'FN');
                                return (
                                  <td key={`${skin.id}-FN`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">FN</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* MW Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {milSpecSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'MW');
                                return (
                                  <td key={`${skin.id}-MW`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">MW</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* FT Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {milSpecSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'FT');
                                return (
                                  <td key={`${skin.id}-FT`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">FT</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* WW Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {milSpecSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'WW');
                                return (
                                  <td key={`${skin.id}-WW`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">WW</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* BS Row */}
                            <tr>
                              {milSpecSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'BS');
                                return (
                                  <td key={`${skin.id}-BS`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">BS</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Restricted Section */}
              {(() => {
                const restrictedSkins = collection.skins.filter(skin => 
                  skin.rarity === 'Restricted' || skin.rarity === 'restricted'
                );
                if (restrictedSkins.length > 0) {
                  return (
                    <div className="border border-dark-border-primary/60 rounded-lg">
                      {/* Rarity Header */}
                      <div className="bg-dark-bg-tertiary/50 px-4 py-2 border-b border-dark-border-primary/30">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-dark-border-primary" style={{ backgroundColor: restrictedSkins[0]?.rarity_color }}></div>
                          <span className="font-semibold text-dark-text-primary">Restricted</span>
                        </div>
                      </div>
                      
                      {/* Skins Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-dark-border-primary/30">
                              {restrictedSkins.map((skin) => (
                                <th key={skin.id} className="text-center py-2 px-2 font-semibold text-dark-text-secondary border-r border-dark-border-primary/30 last:border-r-0">
                                  <div className="flex flex-col items-center gap-1">
                                    <img 
                                      src={skin.image} 
                                      alt={skin.name}
                                      className="w-6 h-6 object-contain rounded"
                                    />
                                    <div 
                                      className="text-sm font-medium px-2 py-1 rounded text-center"
                                      style={{ 
                                        color: skin.rarity_color,
                                        backgroundColor: `${skin.rarity_color}20`,
                                        border: `1px solid ${skin.rarity_color}40`,
                                        minWidth: '120px'
                                      }}
                                    >
                                      {skin.name.replace(/^.*\|\s+/, '')}
                                    </div>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {/* FN Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {restrictedSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'FN');
                                return (
                                  <td key={`${skin.id}-FN`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">FN</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* MW Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {restrictedSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'MW');
                                return (
                                  <td key={`${skin.id}-MW`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">MW</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* FT Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {restrictedSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'FT');
                                return (
                                  <td key={`${skin.id}-FT`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">FT</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* WW Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {restrictedSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'WW');
                                return (
                                  <td key={`${skin.id}-WW`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">WW</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* BS Row */}
                            <tr>
                              {restrictedSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'BS');
                                return (
                                  <td key={`${skin.id}-BS`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">BS</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Classified Section */}
              {(() => {
                const classifiedSkins = collection.skins.filter(skin => 
                  skin.rarity === 'Classified' || skin.rarity === 'classified'
                );
                if (classifiedSkins.length > 0) {
                  return (
                    <div className="border border-dark-border-primary/60 rounded-lg">
                      {/* Rarity Header */}
                      <div className="bg-dark-bg-tertiary/50 px-4 py-2 border-b border-dark-border-primary/30">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-dark-border-primary" style={{ backgroundColor: classifiedSkins[0]?.rarity_color }}></div>
                          <span className="font-semibold text-dark-text-primary">Classified</span>
                        </div>
                      </div>
                      
                      {/* Skins Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-dark-border-primary/30">
                              {classifiedSkins.map((skin) => (
                                <th key={skin.id} className="text-center py-2 px-2 font-semibold text-dark-text-secondary border-r border-dark-border-primary/30 last:border-r-0">
                                  <div className="flex flex-col items-center gap-1">
                                    <img 
                                      src={skin.image} 
                                      alt={skin.name}
                                      className="w-6 h-6 object-contain rounded"
                                    />
                                    <div 
                                      className="text-sm font-medium px-2 py-1 rounded text-center"
                                      style={{ 
                                        color: skin.rarity_color,
                                        backgroundColor: `${skin.rarity_color}20`,
                                        border: `1px solid ${skin.rarity_color}40`,
                                        minWidth: '120px'
                                      }}
                                    >
                                      {skin.name.replace(/^.*\|\s+/, '')}
                                    </div>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {/* FN Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {classifiedSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'FN');
                                return (
                                  <td key={`${skin.id}-FN`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">FN</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* MW Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {classifiedSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'MW');
                                return (
                                  <td key={`${skin.id}-MW`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">MW</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* FT Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {classifiedSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'FT');
                                return (
                                  <td key={`${skin.id}-FT`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">FT</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* WW Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {classifiedSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'WW');
                                return (
                                  <td key={`${skin.id}-WW`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">WW</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* BS Row */}
                            <tr>
                              {classifiedSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'BS');
                                return (
                                  <td key={`${skin.id}-BS`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">BS</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Covert Section */}
              {(() => {
                const covertSkins = collection.skins.filter(skin => 
                  skin.rarity === 'Covert' || skin.rarity === 'covert'
                );
                if (covertSkins.length > 0) {
                  return (
                    <div className="border border-dark-border-primary/60 rounded-lg">
                      {/* Rarity Header */}
                      <div className="bg-dark-bg-tertiary/50 px-4 py-2 border-b border-dark-border-primary/30">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-dark-border-primary" style={{ backgroundColor: covertSkins[0]?.rarity_color }}></div>
                          <span className="font-semibold text-dark-text-primary">Covert</span>
                        </div>
                      </div>
                      
                      {/* Skins Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-dark-border-primary/30">
                              {covertSkins.map((skin) => (
                                <th key={skin.id} className="text-center py-2 px-2 font-semibold text-dark-text-secondary border-r border-dark-border-primary/30 last:border-r-0">
                                  <div className="flex flex-col items-center gap-1">
                                    <img 
                                      src={skin.image} 
                                      alt={skin.name}
                                      className="w-6 h-6 object-contain rounded"
                                    />
                                    <div 
                                      className="text-sm font-medium px-2 py-1 rounded text-center"
                                      style={{ 
                                        color: skin.rarity_color,
                                        backgroundColor: `${skin.rarity_color}20`,
                                        border: `1px solid ${skin.rarity_color}40`,
                                        minWidth: '120px'
                                      }}
                                    >
                                      {skin.name.replace(/^.*\|\s+/, '')}
                                    </div>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {/* FN Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {covertSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'FN');
                                return (
                                  <td key={`${skin.id}-FN`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">FN</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* MW Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {covertSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'MW');
                                return (
                                  <td key={`${skin.id}-MW`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">MW</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* FT Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {covertSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'FT');
                                return (
                                  <td key={`${skin.id}-FT`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">FT</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* WW Row */}
                            <tr className="border-b border-dark-border-primary/30">
                              {covertSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'WW');
                                return (
                                  <td key={`${skin.id}-WW`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">WW</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            
                            {/* BS Row */}
                            <tr>
                              {covertSkins.map((skin) => {
                                const price = getPriceForWear(skin, 'BS');
                                return (
                                  <td key={`${skin.id}-BS`} className="text-center py-2 px-2 border-r border-dark-border-primary/30 last:border-r-0">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-dark-text-muted">BS</span>
                                      {price ? (
                                        <span className="font-medium text-accent-success text-xs">
                                          ${price}
                                        </span>
                                      ) : (
                                        <span className="text-dark-text-muted text-xs">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        ))}
      </div>

      {filteredCollections.length === 0 && collections.length > 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-dark-text-primary mb-2">No Collections Match Filters</h2>
          <p className="text-dark-text-muted mb-4">Try adjusting your search criteria or clear the filters.</p>
          <button 
            onClick={() => setCollectionFilter("")}
            className="btn-primary"
          >
            Clear Filter
          </button>
        </div>
      )}

      {collections.length === 0 && (
        <div className="text-center py-16">
          <div className="text-8xl mb-6">🔍</div>
          <h2 className="text-3xl font-bold text-dark-text-primary mb-4">No Collections Found</h2>
          <p className="text-dark-text-muted text-lg mb-6">No weapon skin collections are available at the moment.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Refresh Page
          </button>
        </div>
      )}
    </div>
  );
}
