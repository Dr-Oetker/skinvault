import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { selectFrom } from "../utils/supabaseApi";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ImageWithFallback from "../components/ImageWithFallback";

interface Case {
  id: number;
  case_name: string;
  release_date: string;
  item_nameid: string;
  created_at: string;
  images: string;
}

interface CasePrice {
  id: number;
  case_id: number;
  recorded_at: string;
  highest_buy_order: number;
  lowest_sell_order: number;
  buy_order_count: number;
  sell_order_count: number;
  spread: number;
}

interface CaseWithPrice extends Case {
  currentPrice: CasePrice | null;
}

export default function CasePriceChecker() {
  const [cases, setCases] = useState<CaseWithPrice[]>([]);
  const [filteredCases, setFilteredCases] = useState<CaseWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"release_date" | "name" | "price_cheap" | "price_expensive">("release_date");

  useEffect(() => {
    const fetchCasesWithPrices = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all cases
        const { data: casesData, error: casesError } = await selectFrom("cases", {
          select: "id, case_name, release_date, item_nameid, created_at, images",
          order: { column: "case_name", ascending: true }
        });

        if (casesError) {
          throw casesError;
        }

        if (!casesData || casesData.length === 0) {
          throw new Error("No cases found");
        }

        console.log("Fetched cases:", casesData.map(c => ({ id: c.id, name: c.case_name })));

        // Test: Let's see what's in case_prices table
        const { data: testPricesData, error: testPricesError } = await selectFrom("case_prices", {
          select: "id, case_id, recorded_at, highest_buy_order, lowest_sell_order",
          limit: 5
        });
        console.log("Sample case_prices data:", testPricesData);
        console.log("Types - case_id in prices:", testPricesData?.map(p => ({ case_id: p.case_id, type: typeof p.case_id })));
        console.log("Types - id in cases:", casesData.map(c => ({ id: c.id, type: typeof c.id })));

        // Alternative approach: Fetch all prices and match them
        const { data: allPricesData, error: allPricesError } = await selectFrom("case_prices", {
          select: "id, case_id, recorded_at, highest_buy_order, lowest_sell_order, buy_order_count, sell_order_count, spread",
          order: { column: "recorded_at", ascending: false }
        });

        console.log("All prices data:", allPricesData);

        if (allPricesError) {
          console.error("Error fetching all prices:", allPricesError);
        }

        // Group prices by case_id and get the latest for each
        const latestPricesByCaseId = new Map<number, CasePrice>();
        if (allPricesData) {
          allPricesData.forEach((price: CasePrice) => {
            if (!latestPricesByCaseId.has(price.case_id)) {
              latestPricesByCaseId.set(price.case_id, price);
            }
          });
        }

        console.log("Latest prices by case ID:", Array.from(latestPricesByCaseId.entries()));

        // Match cases with their latest prices
        const casesWithPrices = casesData.map((caseItem: Case) => {
          const currentPrice = latestPricesByCaseId.get(caseItem.id) || null;
          console.log(`Case ${caseItem.id} (${caseItem.case_name}) -> Price:`, currentPrice);
          
          return {
            ...caseItem,
            currentPrice
          };
        });

        setCases(casesWithPrices);
        setFilteredCases(casesWithPrices);
      } catch (err) {
        console.error("Error fetching cases with prices:", err);
        setError(err instanceof Error ? err.message : "Failed to load case prices");
      } finally {
        setLoading(false);
      }
    };

    fetchCasesWithPrices();
  }, []);

  // Filter and sort cases based on search term and sort option
  useEffect(() => {
    let filtered = cases;

    // Filter by search term
    if (searchTerm) {
      filtered = cases.filter(caseItem =>
        caseItem.case_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort cases
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.case_name.localeCompare(b.case_name);
        
        case "price_cheap":
          const aPrice = a.currentPrice?.lowest_sell_order || Infinity;
          const bPrice = b.currentPrice?.lowest_sell_order || Infinity;
          return aPrice - bPrice;
        
        case "price_expensive":
          const aPriceExp = a.currentPrice?.lowest_sell_order || 0;
          const bPriceExp = b.currentPrice?.lowest_sell_order || 0;
          return bPriceExp - aPriceExp;
        
        case "release_date":
        default:
          return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
      }
    });

    setFilteredCases(filtered);
  }, [cases, searchTerm, sortBy]);

  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  const getPriceChangeColor = (spread: number): string => {
    if (spread < 1) return "text-accent-success";
    if (spread < 5) return "text-accent-warning";
    return "text-accent-error";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="glass-card p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-dark-text-primary mb-2">Error Loading Cases</h2>
            <p className="text-dark-text-muted mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-4">📦 Case Price Checker</h1>
          <p className="text-dark-text-muted text-lg max-w-2xl mx-auto">
            Track current prices and market data for CS:GO cases. Click on any case to view detailed historical data and charts.
          </p>
        </div>

        {/* Search and Sort Controls */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-dark-bg-secondary border border-dark-border-primary rounded-lg text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-300"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <label className="text-sm font-medium text-dark-text-primary whitespace-nowrap">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 bg-dark-bg-secondary border border-dark-border-primary rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-300"
              >
                <option value="release_date">Release Date (New to Old)</option>
                <option value="name">Alphabetical</option>
                <option value="price_cheap">Price (Cheapest First)</option>
                <option value="price_expensive">Price (Most Expensive First)</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-dark-text-muted whitespace-nowrap">
              {filteredCases.length} of {cases.length} cases
            </div>
          </div>
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCases.map((caseItem) => (
            <Link
              key={caseItem.id}
              to={`/tools/case-price-checker/${caseItem.id}`}
              className="group glass-card rounded-2xl p-6 hover:shadow-dark-lg transition-all duration-300 border border-dark-border-primary/60 hover:border-accent-primary/50"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Case Image */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-dark-bg-secondary">
                  <ImageWithFallback 
                    src={caseItem.images} 
                    alt={caseItem.case_name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Case Name */}
                <h3 className="text-lg font-semibold text-dark-text-primary group-hover:text-accent-primary transition-colors duration-300 line-clamp-2">
                  {caseItem.case_name}
                </h3>

                {/* Price Information */}
                {caseItem.currentPrice ? (
                  <div className="w-full space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-dark-text-muted">Buy Order:</span>
                      <span className="text-sm font-bold text-accent-success">
                        {formatPrice(caseItem.currentPrice.highest_buy_order)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-dark-text-muted">Sell Order:</span>
                      <span className="text-sm font-bold text-accent-error">
                        {formatPrice(caseItem.currentPrice.lowest_sell_order)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-dark-text-muted">Spread:</span>
                      <span className={`text-sm font-bold ${getPriceChangeColor(caseItem.currentPrice.spread)}`}>
                        {formatPrice(caseItem.currentPrice.spread)}
                      </span>
                    </div>
                    <div className="text-xs text-dark-text-muted">
                      Updated: {new Date(caseItem.currentPrice.recorded_at).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="text-sm text-dark-text-muted">No price data available</div>
                  </div>
                )}

                {/* View Details Arrow */}
                <div className="flex items-center text-accent-primary text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                  <span>View Details</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-12 glass-card p-6">
          <h2 className="text-2xl font-bold text-dark-text-primary mb-4 text-center">
            {searchTerm ? 'Filtered Results' : 'Market Summary'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-primary mb-2">
                {filteredCases.length}
              </div>
              <div className="text-dark-text-muted">
                {searchTerm ? 'Matching Cases' : 'Total Cases'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-success mb-2">
                {filteredCases.filter(c => c.currentPrice).length}
              </div>
              <div className="text-dark-text-muted">With Price Data</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-warning mb-2">
                {filteredCases.filter(c => c.currentPrice && c.currentPrice.spread < 1).length}
              </div>
              <div className="text-dark-text-muted">Low Spread Cases</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
