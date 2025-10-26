import { useState, useEffect } from "react";
import { selectFrom } from "../utils/supabaseApi";
import { trackTradeUpView } from "../utils/analytics";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ImageWithFallback from "../components/ImageWithFallback";

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
          
          const wearEntry = skin.wears_extended.find(w => w.wear === wear && w.enabled && w.variant === 'normal' && w.price > 0);
          if (wearEntry && wearEntry.price < cheapestLowerPrice) {
            cheapestLowerPrice = wearEntry.price;
            cheapestLowerSkin = skin;
          }
        });

        if (!cheapestLowerSkin || cheapestLowerPrice === Infinity) return;

        const combinedPrice = cheapestLowerPrice * 10;

        // Calculate profit for each higher rarity skin
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
          if (representativeHigherSkin) return;
          
          if (!skin.wears_extended) return;
          
          const targetWearEntry = skin.wears_extended.find(w => w.wear === wear && w.enabled && w.variant === 'normal' && w.price > 0);
          
          let actualPrice = 0;
          
          if (targetWearEntry) {
            actualPrice = targetWearEntry.price;
          } else {
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

          if (actualPrice > combinedPrice) {
            representativeHigherSkin = skin;
            representativeHigherPrice = actualPrice;
          }
        });

        if (!representativeHigherSkin) return;

        const profit = representativeHigherPrice - combinedPrice;
        const profitPercent = (profit / combinedPrice) * 100;
        const totalHigherRaritySkins = higherRaritySkins.length;
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

export default function TradeUpOpportunities() {
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tradeUpOpportunities, setTradeUpOpportunities] = useState<TradeUpOpportunity[]>([]);

  useEffect(() => {
    const fetchSkins = async () => {
      try {
        setLoading(true);
        
        // Fetch all skins using REST API (same approach as SkinTable)
        const { data: allSkinsData, error: skinsError } = await selectFrom("skins", {
          select: "id, name, image, weapon, rarity, rarity_color, wears_extended, collections"
        });
        
        // Filter out gloves and knives in JavaScript
        const excludePatterns = ['glove', 'knife', 'bayonet', 'karambit', 'butterfly', 'flip', 'gut', 'huntsman', 'falchion', 'shadow', 'bowie', 'navaja', 'stiletto', 'talon', 'ursus', 'classic'];
        const skinsData = allSkinsData?.filter((skin: any) => 
          !excludePatterns.some(pattern => skin.weapon.toLowerCase().includes(pattern))
        );

        if (skinsError) {
          console.error("Error fetching skins:", skinsError);
          return;
        }

        if (!skinsData) {
          console.error("No skins data received");
          return;
        }

        // Group skins by collection and rarity (same logic as SkinTable)
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

        // Convert to array format
        const collectionsArray: CollectionData[] = Array.from(collectionsMap.entries())
          .map(([collectionName, rarityMap]) => {
            // Get all skins from this collection
            const allSkins: Skin[] = [];
            rarityMap.forEach(skins => {
              allSkins.push(...skins);
            });

            return {
              name: collectionName,
              skins: allSkins
            };
          });

        setCollections(collectionsArray);
        
        // Calculate trade-up opportunities
        const opportunities = calculateTradeUpOpportunities(collectionsArray);
        setTradeUpOpportunities(opportunities);
      } catch (error) {
        console.error("Error in fetchSkins:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkins();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-4">💰 Trade-Up Opportunities</h1>
          <p className="text-dark-text-muted text-lg max-w-2xl mx-auto">
            Discover profitable trade-up contracts sorted by expected profit. Find the best opportunities to upgrade your skins.
          </p>
        </div>

        {/* Trade-Up Opportunities Section */}
        {tradeUpOpportunities.length > 0 ? (
          <div className="glass-card p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gradient mb-2">Available Opportunities</h2>
              <p className="text-dark-text-muted">
                {tradeUpOpportunities.length} profitable trade-up contracts found
              </p>
            </div>

            <div className="space-y-4">
              {tradeUpOpportunities.map((opportunity, index) => (
                <div 
                  key={`${opportunity.collectionName}-${opportunity.wear}-${opportunity.lowerRarity}`}
                  className="bg-dark-bg-tertiary/50 rounded-lg p-4 border border-dark-border-primary/60 hover:bg-dark-bg-tertiary/70 transition-colors cursor-pointer"
                  onClick={() => trackTradeUpView(opportunity.collectionName, opportunity.expectedProfit)}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-white text-lg">
                      #{index + 1}
                    </div>

                    {/* Opportunity Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-dark-text-primary truncate">
                          {opportunity.collectionName}
                        </h3>
                        <span className="px-2 py-1 bg-dark-bg-primary rounded text-sm font-medium text-dark-text-secondary flex-shrink-0">
                          {opportunity.wear}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <ImageWithFallback 
                            src={opportunity.lowerRaritySkin.image} 
                            alt={opportunity.lowerRaritySkin.name}
                            className="w-8 h-8 object-contain rounded"
                          />
                          <div className="flex flex-col">
                            <span className="text-dark-text-primary font-medium truncate max-w-32">
                              {opportunity.lowerRaritySkin.name.replace(/^.*\|\s+/, '')}
                            </span>
                            <span 
                              className="text-sm font-medium truncate max-w-32"
                              style={{ color: opportunity.lowerRaritySkin.rarity_color }}
                            >
                              {opportunity.lowerRarity}
                            </span>
                            <span className="text-dark-text-muted text-xs">
                              10× ${opportunity.lowerRarityPrice}
                            </span>
                            <span className="text-dark-text-primary font-bold">
                              ${opportunity.combinedPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <span className="text-dark-text-muted text-xl">→</span>

                        <div className="flex items-center gap-2">
                          <ImageWithFallback 
                            src={opportunity.higherRaritySkin.image} 
                            alt={opportunity.higherRaritySkin.name}
                            className="w-8 h-8 object-contain rounded"
                          />
                          <div className="flex flex-col">
                            <span className="text-dark-text-primary font-medium truncate max-w-32">
                              {opportunity.higherRaritySkin.name.replace(/^.*\|\s+/, '')}
                            </span>
                            <span 
                              className="text-sm font-medium truncate max-w-32"
                              style={{ color: opportunity.higherRaritySkin.rarity_color }}
                            >
                              {opportunity.higherRarity}
                            </span>
                            <span className="text-dark-text-muted text-xs">
                              ${opportunity.higherRarityPrice.toFixed(2)}
                            </span>
                            <span className="text-dark-text-primary font-bold">
                              ${opportunity.higherRarityPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="text-center">
                        <div className="text-lg font-bold text-accent-success">
                          +${opportunity.profit.toFixed(2)}
                        </div>
                        <div className="text-sm text-dark-text-muted">
                          {opportunity.profitPercent.toFixed(0)}% profit
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-bold text-accent-primary">
                          {opportunity.hitProbability.toFixed(0)}%
                        </div>
                        <div className="text-sm text-dark-text-muted">
                          {opportunity.profitableHigherRaritySkins}/{opportunity.totalHigherRaritySkins} hit
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-bold text-accent-warning">
                          ${opportunity.expectedProfit.toFixed(2)}
                        </div>
                        <div className="text-sm text-dark-text-muted">
                          expected
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-dark-text-primary mb-2">No Opportunities Found</h2>
            <p className="text-dark-text-muted">
              No profitable trade-up contracts are currently available. Check back later for new opportunities!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
