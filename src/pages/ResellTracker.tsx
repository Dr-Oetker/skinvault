import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import ResellTrackerModal from '../components/ResellTrackerModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { selectFrom, deleteFrom, updateTable } from '../utils/supabaseApi';

interface TrackerEntry {
  id: string;
  skin_id: string;
  buy_price: number;
  wear_value?: number | null;
  wear?: string | null;
  notes?: string | null;
  bought_at: string;
  created_at: string;
  updated_at: string;
  skin?: {
    id: string;
    name: string;
    image: string;
    wears_extended?: Array<{
      wear: string;
      price: number;
      enabled: boolean;
      variant: 'normal' | 'stattrak' | 'souvenir';
    }>;
    last_price_update?: string;
  };
}

interface EditFormData {
  buy_price: string;
  wear_value: string;
  wear: string;
  notes: string;
  bought_at: string;
}

export default function ResellTracker() {
  const { user } = useAuth();
  const [trackers, setTrackers] = useState<TrackerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTracker, setEditingTracker] = useState<TrackerEntry | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    buy_price: "",
    wear_value: "",
    wear: "",
    notes: "",
    bought_at: ""
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

  const getPriceForWear = (wear: string): number | null => {
    if (!editingTracker?.skin?.wears_extended) return null;
    const wearEntry = editingTracker.skin.wears_extended.find(w => w.wear === wear && w.enabled && w.variant === 'normal');
    return wearEntry?.price || null;
  };

  const handleFloatChange = (value: string) => {
    setEditFormData(prev => ({ ...prev, wear_value: value }));
    if (value) {
      const float = parseFloat(value);
      if (!isNaN(float) && float >= 0 && float <= 1) {
        const detectedWear = getWearFromFloat(float);
        setEditFormData(prev => ({ ...prev, wear: detectedWear }));
      }
    }
  };

  const handleWearSelect = (wear: string) => {
    setEditFormData(prev => ({ ...prev, wear, wear_value: "" }));
  };

  useEffect(() => {
    const fetchTrackers = async () => {
      if (!user) return;
      setLoading(true);
      
      // First, get the tracker entries
      const { data: trackerData } = await selectFrom("resell_tracker", {
        select: "id, skin_id, buy_price, wear_value, wear, notes, bought_at, created_at, updated_at",
        eq: { user_id: user.id },
        order: { column: "created_at", ascending: false }
      });
      
      if (!trackerData) {
        setTrackers([]);
        setLoading(false);
        return;
      }
      
      // Then, fetch skin data for each tracker
      const trackersWithSkins = await Promise.all(
        trackerData.map(async (tracker) => {
          const { data: skinData } = await selectFrom("skins", {
            select: "id, name, image, wears_extended, last_price_update",
            eq: { id: tracker.skin_id },
            single: true
          });
          
          return {
            ...tracker,
            skin: skinData ? {
              id: skinData.id,
              name: skinData.name,
              image: skinData.image,
              wears_extended: skinData.wears_extended,
              last_price_update: skinData.last_price_update
            } : undefined
          };
        })
      );
      
      setTrackers(trackersWithSkins);
      setLoading(false);
    };
    if (user) fetchTrackers();
  }, [user]);

  const handleDelete = async (trackerId: string) => {
    if (!user) return;
    setDeleting(trackerId);
    const { error } = await deleteFrom("resell_tracker", {
      eq: { id: trackerId, user_id: user.id }
    });
    if (!error) {
      setTrackers(trackers.filter(t => t.id !== trackerId));
    }
    setDeleting(null);
  };

  const handleEdit = (tracker: TrackerEntry) => {
    setEditingTracker(tracker);
    setEditFormData({
      buy_price: tracker.buy_price.toString(),
      wear_value: tracker.wear_value?.toString() || "",
      wear: tracker.wear || "",
      notes: tracker.notes || "",
      bought_at: tracker.bought_at
    });
    setShowEditModal(true);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleEditSubmit = async () => {
    if (!user || !editingTracker) return;
    
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      const price = parseFloat(editFormData.buy_price);
      const floatValue = editFormData.wear_value ? parseFloat(editFormData.wear_value) : null;
      
      if (!editFormData.wear && !editFormData.wear_value) {
        setErrorMsg("Please select a wear or enter a float value.");
        setSaving(false);
        return;
      }
      if (!editFormData.bought_at) {
        setErrorMsg("Please select the date you bought this skin.");
        setSaving(false);
        return;
      }
      if (!editFormData.buy_price || isNaN(price)) {
        setErrorMsg("Please enter a valid buy price.");
        setSaving(false);
        return;
      }
      
      const { error } = await updateTable("resell_tracker", {
          buy_price: price,
          wear_value: floatValue,
          wear: editFormData.wear,
          notes: editFormData.notes.trim() || null,
          bought_at: editFormData.bought_at,
          updated_at: new Date().toISOString()
        }, {
          eq: { id: editingTracker.id, user_id: user.id }
        });
      
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("Tracker updated successfully!");
        // Update the local state
        setTrackers(trackers.map(t => 
          t.id === editingTracker.id 
            ? { 
                ...t, 
                buy_price: price,
                wear_value: floatValue || undefined,
                wear: editFormData.wear,
                notes: editFormData.notes.trim() || null,
                bought_at: editFormData.bought_at,
                updated_at: new Date().toISOString()
              }
            : t
        ));
        setShowEditModal(false);
        setEditingTracker(null);
      }
      setSaving(false);
    } catch (error) {
      setErrorMsg("An error occurred. Please try again.");
      setSaving(false);
    }
  };

  const getCurrentPrice = (tracker: TrackerEntry) => {
    if (!tracker.skin?.wears_extended) return null;
    const enabled = tracker.skin.wears_extended.filter(w => w.enabled);
    if (enabled.length === 0) return null;
    
    // If we have a specific wear, use that price
    if (tracker.wear) {
      const wearEntry = enabled.find(w => w.wear === tracker.wear);
      return wearEntry?.price || null;
    }
    
    // If we have a float value, find the closest wear
    if (tracker.wear_value !== undefined) {
      // For now, return the average price
      const avgPrice = enabled.reduce((sum, w) => sum + w.price, 0) / enabled.length;
      return avgPrice;
    }
    
    // Fallback to average price
    const avgPrice = enabled.reduce((sum, w) => sum + w.price, 0) / enabled.length;
    return avgPrice;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const getWearDisplay = (tracker: TrackerEntry) => {
    if (tracker.wear) {
      if (tracker.wear_value !== undefined && tracker.wear_value !== null) {
        return `${tracker.wear} (Float: ${tracker.wear_value.toFixed(4)})`;
      }
      return tracker.wear;
    }
    return "Unknown";
  };

  const getTradeLockInfo = (boughtAt: string) => {
    const purchaseDate = new Date(boughtAt);
    const unlockDate = new Date(purchaseDate);
    unlockDate.setDate(unlockDate.getDate() + 7);
    unlockDate.setHours(9, 0, 0, 0); // 9 AM CET
    
    const now = new Date();
    const isTradeable = now >= unlockDate;
    
    return {
      isTradeable,
      unlockDate,
      unlockDateFormatted: unlockDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-2 sm:px-6">
      <h1 className="text-3xl font-bold mb-6 text-dark-text-primary tracking-tight">Resell Tracker</h1>
      {loading ? (
        <div className="glass-card p-6 md:p-8 shadow-dark-lg border border-dark-border-primary/60 mb-8">
          <LoadingSkeleton type="skeleton" lines={6} />
        </div>
      ) : trackers.length === 0 ? (
        <div className="text-dark-text-muted text-center mt-16 text-lg">
          You have no resell trackers yet.<br />
          <span className="text-base text-dark-text-tertiary">You can add one for a skin on the skin's page.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {trackers.map(tracker => {
            const currentPrice = getCurrentPrice(tracker);
            const profitLoss = currentPrice ? currentPrice - tracker.buy_price : null;
            const profitLossPercent = profitLoss && tracker.buy_price ? (profitLoss / tracker.buy_price) * 100 : null;
            return (
              <div key={tracker.id} className="glass-card flex flex-col md:flex-row gap-4 p-5 md:p-6 items-center md:items-stretch shadow-dark-lg border border-dark-border-primary/60">
                  {tracker.skin && (
                  <Link to={`/skins/${tracker.skin.id}`} className="flex-shrink-0 mb-2 md:mb-0 md:mr-6">
                      <img 
                        src={tracker.skin.image} 
                        alt={tracker.skin.name} 
                      className="w-20 h-20 object-contain rounded-xl border border-dark-border-primary/60 shadow"
                      />
                    </Link>
                  )}
                <div className="flex-1 w-full flex flex-col justify-between">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                      <div>
                        {tracker.skin ? (
                        <Link to={`/skins/${tracker.skin.id}`} className="font-bold text-lg md:text-xl text-dark-text-primary hover:underline tracking-tight">
                            {tracker.skin.name}
                          </Link>
                        ) : (
                        <div className="font-bold text-lg md:text-xl text-dark-text-muted">Skin not found</div>
                        )}
                      <div className="text-sm text-dark-text-tertiary mt-1">
                          Bought: {formatDate(tracker.bought_at)} • Wear: {getWearDisplay(tracker)}
                        </div>
                      <div className="text-xs text-dark-text-muted mt-1">
                          Last updated: {formatDateTime(tracker.skin?.last_price_update || tracker.updated_at)}
                        </div>
                        {(() => {
                          const tradeInfo = getTradeLockInfo(tracker.bought_at);
                          return (
                          <div className={`text-xs px-2 py-1 rounded-lg mt-2 inline-block font-semibold ${
                              tradeInfo.isTradeable 
                              ? 'bg-accent-success/20 text-accent-success border border-accent-success/30' 
                              : 'bg-accent-error/20 text-accent-error border border-accent-error/30'
                            }`}>
                              {tradeInfo.isTradeable 
                                ? '✓ Tradeable' 
                                : `🔒 Trade Locked until ${tradeInfo.unlockDateFormatted}`
                              }
                            </div>
                          );
                        })()}
                        {tracker.notes && (
                        <div className="text-xs md:text-sm text-dark-text-muted mt-1 italic">"{tracker.notes}"</div>
                        )}
                      </div>
                    <div className="flex flex-col gap-2 min-w-[90px] w-full md:w-auto items-end md:items-start">
                        <button
                          onClick={() => handleEdit(tracker)}
                        className="btn-secondary text-accent-primary border-accent-primary/40 hover:bg-accent-primary/10 text-sm px-4 py-2 rounded-lg font-semibold w-full md:w-auto"
                          title="Edit tracker"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tracker.id)}
                          disabled={deleting === tracker.id}
                        className="btn-secondary text-accent-error border-accent-error/40 hover:bg-accent-error/10 text-sm px-4 py-2 rounded-lg font-semibold w-full md:w-auto"
                          title="Delete tracker"
                        >
                          {deleting === tracker.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  <div className="mt-4 flex flex-wrap gap-6 items-center">
                    <div className="text-sm text-dark-text-tertiary">
                      <span className="font-medium">Buy Price:</span>
                      <span className="font-bold ml-1 text-dark-text-primary">${tracker.buy_price.toFixed(2)}</span>
                      </div>
                      {currentPrice && (
                        <>
                        <div className="text-sm text-dark-text-tertiary">
                          <span className="font-medium">Current Price:</span>
                          <span className="font-bold ml-1 text-dark-text-primary">${currentPrice.toFixed(2)}</span>
                          </div>
                        <div className={`text-sm font-bold ${
                          profitLoss && profitLoss > 0 ? 'text-accent-success' : 'text-accent-error'
                          }`}>
                            {profitLoss && profitLoss > 0 ? '+' : ''}{profitLoss?.toFixed(2)} 
                          {profitLossPercent !== null && profitLossPercent !== undefined && (
                            <span className="ml-1">({profitLossPercent.toFixed(1)}%)</span>
                          )}
                          </div>
                        </>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showEditModal && editingTracker && editingTracker.skin && (
        <ResellTrackerModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingTracker(null);
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
              const { error } = await updateTable("resell_tracker", {
                  buy_price: price,
                  wear_value: floatValue,
                  wear: formData.wear,
                  notes: formData.notes.trim() || null,
                  bought_at: formData.bought_at,
                  updated_at: new Date().toISOString(),
                }, {
                  eq: { id: editingTracker.id, user_id: user.id }
                });
              if (error) {
                setErrorMsg(error.message);
              } else {
                setSuccessMsg("Tracker updated successfully!");
                // Update the local state
                setTrackers(trackers.map(t => 
                  t.id === editingTracker.id 
                    ? { 
                        ...t, 
                        buy_price: price,
                        wear_value: floatValue || undefined,
                        wear: formData.wear,
                        notes: formData.notes.trim() || null,
                        bought_at: formData.bought_at,
                        updated_at: new Date().toISOString()
                      }
                    : t
                ));
                setShowEditModal(false);
                setEditingTracker(null);
              }
              setSaving(false);
            } catch (e) {
              setErrorMsg("An error occurred. Please try again.");
              setSaving(false);
            }
          }}
          skin={editingTracker.skin}
          initialData={editFormData}
          mode="edit"
          loading={saving}
          errorMsg={errorMsg}
          successMsg={successMsg}
          floatInputFullWidth={true}
        />
      )}
    </div>
  );
} 