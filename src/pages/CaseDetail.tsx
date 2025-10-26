import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { selectFrom } from "../utils/supabaseApi";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ImageWithFallback from "../components/ImageWithFallback";
import PriceChart from "../components/PriceChart";

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

export default function CaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [currentPrice, setCurrentPrice] = useState<CasePrice | null>(null);
  const [priceHistory, setPriceHistory] = useState<CasePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCaseData = async () => {
      if (!caseId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch case information
        const { data: caseDataResult, error: caseError } = await selectFrom("cases", {
          select: "id, case_name, release_date, item_nameid, created_at, images",
          eq: { id: parseInt(caseId) },
          limit: 1
        });

        if (caseError) {
          throw caseError;
        }

        if (!caseDataResult || caseDataResult.length === 0) {
          throw new Error("Case not found");
        }

        setCaseData(caseDataResult[0]);

        // Fetch current price (latest)
        const { data: currentPriceData, error: currentPriceError } = await selectFrom("case_prices", {
          select: "id, case_id, recorded_at, highest_buy_order, lowest_sell_order, buy_order_count, sell_order_count, spread",
          eq: { case_id: parseInt(caseId) },
          order: { column: "recorded_at", ascending: false },
          limit: 1
        });

        if (currentPriceError) {
          console.error("Error fetching current price:", currentPriceError);
        } else if (currentPriceData && currentPriceData.length > 0) {
          setCurrentPrice(currentPriceData[0]);
        }

        // Fetch price history (last 30 days or 100 records, whichever is smaller)
        const { data: historyData, error: historyError } = await selectFrom("case_prices", {
          select: "id, case_id, recorded_at, highest_buy_order, lowest_sell_order, buy_order_count, sell_order_count, spread",
          eq: { case_id: parseInt(caseId) },
          order: { column: "recorded_at", ascending: false },
          limit: 100
        });

        if (historyError) {
          console.error("Error fetching price history:", historyError);
        } else if (historyData) {
          setPriceHistory(historyData);
        }

      } catch (err) {
        console.error("Error fetching case data:", err);
        setError(err instanceof Error ? err.message : "Failed to load case data");
      } finally {
        setLoading(false);
      }
    };

    fetchCaseData();
  }, [caseId]);

  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriceChangeColor = (spread: number): string => {
    if (spread < 1) return "text-accent-success";
    if (spread < 5) return "text-accent-warning";
    return "text-accent-error";
  };

  const getPriceChangeBgColor = (spread: number): string => {
    if (spread < 1) return "bg-accent-success/10 border-accent-success/30";
    if (spread < 5) return "bg-accent-warning/10 border-accent-warning/30";
    return "bg-accent-error/10 border-accent-error/30";
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

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-dark-bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="glass-card p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-dark-text-primary mb-2">Case Not Found</h2>
            <p className="text-dark-text-muted mb-4">{error || "The requested case could not be found."}</p>
            <Link to="/tools/case-price-checker" className="btn-primary">
              Back to Case Price Checker
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/tools/case-price-checker" 
            className="inline-flex items-center text-accent-primary hover:text-accent-secondary transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Case Price Checker
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-xl overflow-hidden bg-dark-bg-secondary">
                <ImageWithFallback 
                  src={caseData.images} 
                  alt={caseData.case_name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gradient mb-2">{caseData.case_name}</h1>
              <p className="text-dark-text-muted text-lg mb-4">
                Released: {formatDate(caseData.release_date)}
              </p>
              {currentPrice && (
                <div className="flex flex-wrap gap-4">
                  <div className={`px-4 py-2 rounded-lg border ${getPriceChangeBgColor(currentPrice.spread)}`}>
                    <div className="text-sm text-dark-text-muted">Spread</div>
                    <div className={`text-xl font-bold ${getPriceChangeColor(currentPrice.spread)}`}>
                      {formatPrice(currentPrice.spread)}
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-dark-bg-secondary border border-dark-border-primary/60">
                    <div className="text-sm text-dark-text-muted">Buy Orders</div>
                    <div className="text-xl font-bold text-accent-success">
                      {formatPrice(currentPrice.highest_buy_order)}
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-dark-bg-secondary border border-dark-border-primary/60">
                    <div className="text-sm text-dark-text-muted">Sell Orders</div>
                    <div className="text-xl font-bold text-accent-error">
                      {formatPrice(currentPrice.lowest_sell_order)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Market Data */}
        {currentPrice && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-2xl font-bold text-dark-text-primary mb-6">Current Market Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-success mb-2">
                  {formatPrice(currentPrice.highest_buy_order)}
                </div>
                <div className="text-dark-text-muted">Highest Buy Order</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-error mb-2">
                  {formatPrice(currentPrice.lowest_sell_order)}
                </div>
                <div className="text-dark-text-muted">Lowest Sell Order</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-primary mb-2">
                  {currentPrice.buy_order_count.toLocaleString()}
                </div>
                <div className="text-dark-text-muted">Buy Orders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-warning mb-2">
                  {currentPrice.sell_order_count.toLocaleString()}
                </div>
                <div className="text-dark-text-muted">Sell Orders</div>
              </div>
            </div>
            <div className="mt-6 text-center text-sm text-dark-text-muted">
              Last updated: {formatDateTime(currentPrice.recorded_at)}
            </div>
          </div>
        )}

        {/* Price History Chart */}
        {priceHistory.length > 0 && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-2xl font-bold text-dark-text-primary mb-6">Price History</h2>
            <PriceChart data={priceHistory} />
          </div>
        )}

        {/* Historical Data Table */}
        {priceHistory.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold text-dark-text-primary mb-6">Historical Data</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-border-primary/30">
                    <th className="text-left py-3 px-4 font-semibold text-dark-text-secondary">Date</th>
                    <th className="text-right py-3 px-4 font-semibold text-dark-text-secondary">Buy Order</th>
                    <th className="text-right py-3 px-4 font-semibold text-dark-text-secondary">Sell Order</th>
                    <th className="text-right py-3 px-4 font-semibold text-dark-text-secondary">Spread</th>
                    <th className="text-right py-3 px-4 font-semibold text-dark-text-secondary">Buy Count</th>
                    <th className="text-right py-3 px-4 font-semibold text-dark-text-secondary">Sell Count</th>
                  </tr>
                </thead>
                <tbody>
                  {priceHistory.slice(0, 20).map((price, index) => (
                    <tr key={price.id} className="border-b border-dark-border-primary/20 hover:bg-dark-bg-tertiary/50">
                      <td className="py-3 px-4 text-dark-text-primary">
                        {formatDateTime(price.recorded_at)}
                      </td>
                      <td className="py-3 px-4 text-right text-accent-success font-medium">
                        {formatPrice(price.highest_buy_order)}
                      </td>
                      <td className="py-3 px-4 text-right text-accent-error font-medium">
                        {formatPrice(price.lowest_sell_order)}
                      </td>
                      <td className={`py-3 px-4 text-right font-medium ${getPriceChangeColor(price.spread)}`}>
                        {formatPrice(price.spread)}
                      </td>
                      <td className="py-3 px-4 text-right text-dark-text-primary">
                        {price.buy_order_count.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-dark-text-primary">
                        {price.sell_order_count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {priceHistory.length > 20 && (
                <div className="text-center mt-4 text-dark-text-muted">
                  Showing last 20 records of {priceHistory.length} total
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Data Message */}
        {!currentPrice && priceHistory.length === 0 && (
          <div className="glass-card p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-dark-text-primary mb-2">No Price Data Available</h2>
            <p className="text-dark-text-muted">
              This case doesn't have any price history data yet. Check back later for updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
