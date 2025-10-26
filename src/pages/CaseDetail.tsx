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

type TimePeriod = 'daily' | 'weekly' | 'monthly';

export default function CaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [currentPrice, setCurrentPrice] = useState<CasePrice | null>(null);
  const [priceHistory, setPriceHistory] = useState<CasePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');
  const [selectedDay, setSelectedDay] = useState<number>(0);

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

  // Filter data based on time period
  const getFilteredData = (data: CasePrice[], period: TimePeriod): CasePrice[] => {
    if (!data || data.length === 0) return [];
    
    const now = new Date();
    const filteredData: CasePrice[] = [];
    
    switch (period) {
      case 'daily':
        // Show data from the last 24 hours
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        return data.filter(item => new Date(item.recorded_at) >= oneDayAgo);
        
      case 'weekly':
        // Show data from the last 7 days
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return data.filter(item => new Date(item.recorded_at) >= oneWeekAgo);
        
      case 'monthly':
        // Show data from the last 30 days
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return data.filter(item => new Date(item.recorded_at) >= oneMonthAgo);
        
      default:
        return data;
    }
  };

  // Get data for a specific day
  const getDayData = (data: CasePrice[], dayOffset: number): CasePrice[] => {
    if (!data || data.length === 0) return [];
    
    const now = new Date();
    const targetDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    
    return data.filter(item => {
      const itemDate = new Date(item.recorded_at);
      return itemDate >= startOfDay && itemDate < endOfDay;
    }).sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()); // Newest first
  };

  // Get available days for navigation
  const getAvailableDays = (data: CasePrice[]): number[] => {
    if (!data || data.length === 0) return [];
    
    const days = new Set<number>();
    const now = new Date();
    
    data.forEach(item => {
      const itemDate = new Date(item.recorded_at);
      const dayOffset = Math.floor((now.getTime() - itemDate.getTime()) / (24 * 60 * 60 * 1000));
      days.add(dayOffset);
    });
    
    return Array.from(days).sort((a, b) => a - b);
  };

  const filteredPriceHistory = getFilteredData(priceHistory, timePeriod);
  const dayData = getDayData(priceHistory, selectedDay);
  const availableDays = getAvailableDays(priceHistory);

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
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-dark-text-primary mb-4">Price History</h2>
              
              {/* Time Period Selector - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-2 flex-wrap">
                  {(['daily', 'weekly', 'monthly'] as TimePeriod[]).map((period) => (
                    <button
                      key={period}
                      onClick={() => setTimePeriod(period)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 sm:flex-none min-w-0 ${
                        timePeriod === period
                          ? 'bg-accent-primary text-white'
                          : 'bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-tertiary hover:text-dark-text-primary'
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <PriceChart data={filteredPriceHistory} />
          </div>
        )}

        {/* Historical Data Table */}
        {priceHistory.length > 0 && (
          <div className="glass-card p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-dark-text-primary mb-4">Daily Historical Data</h2>
              
              {/* Day Navigation - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <button
                    onClick={() => {
                      const currentIndex = availableDays.indexOf(selectedDay);
                      if (currentIndex < availableDays.length - 1) {
                        setSelectedDay(availableDays[currentIndex + 1]);
                      }
                    }}
                    disabled={availableDays.indexOf(selectedDay) >= availableDays.length - 1}
                    className="p-2 rounded-lg bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-tertiary hover:text-dark-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <span className="px-3 py-2 bg-dark-bg-secondary rounded-lg text-sm font-medium text-dark-text-primary text-center min-w-0 flex-1 sm:flex-none">
                    {selectedDay === 0 ? 'Today' : selectedDay === 1 ? 'Yesterday' : `${selectedDay} days ago`}
                  </span>
                  
                  <button
                    onClick={() => {
                      const currentIndex = availableDays.indexOf(selectedDay);
                      if (currentIndex > 0) {
                        setSelectedDay(availableDays[currentIndex - 1]);
                      }
                    }}
                    disabled={availableDays.indexOf(selectedDay) <= 0}
                    className="p-2 rounded-lg bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-tertiary hover:text-dark-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {dayData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-dark-border-primary/30">
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-dark-text-secondary">Time</th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-dark-text-secondary">Buy</th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-dark-text-secondary">Sell</th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-dark-text-secondary">Spread</th>
                      <th className="hidden sm:table-cell text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-dark-text-secondary">Buy Count</th>
                      <th className="hidden sm:table-cell text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-dark-text-secondary">Sell Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayData.map((price, index) => (
                      <tr key={price.id} className="border-b border-dark-border-primary/20 hover:bg-dark-bg-tertiary/50">
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-dark-text-primary">
                          {new Date(price.recorded_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-accent-success font-medium">
                          {formatPrice(price.highest_buy_order)}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-accent-error font-medium">
                          {formatPrice(price.lowest_sell_order)}
                        </td>
                        <td className={`py-2 sm:py-3 px-2 sm:px-4 text-right font-medium ${getPriceChangeColor(price.spread)}`}>
                          {formatPrice(price.spread)}
                        </td>
                        <td className="hidden sm:table-cell py-2 sm:py-3 px-2 sm:px-4 text-right text-dark-text-primary">
                          {price.buy_order_count.toLocaleString()}
                        </td>
                        <td className="hidden sm:table-cell py-2 sm:py-3 px-2 sm:px-4 text-right text-dark-text-primary">
                          {price.sell_order_count.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-center mt-4 text-dark-text-muted text-sm">
                  Showing {dayData.length} records for {selectedDay === 0 ? 'today' : selectedDay === 1 ? 'yesterday' : `${selectedDay} days ago`}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📅</div>
                <div className="text-dark-text-muted">
                  No data available for {selectedDay === 0 ? 'today' : selectedDay === 1 ? 'yesterday' : `${selectedDay} days ago`}
                </div>
              </div>
            )}
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
