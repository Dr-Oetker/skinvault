import React, { useState, useEffect } from 'react';
import { trackResellTrackerAdd } from '../utils/analytics';

interface WearRange {
  min: number;
  max: number;
  label: string;
}

interface Skin {
  id: string;
  name: string;
  image: string;
  wears_extended?: Array<{
    wear: string;
    price: number;
    enabled: boolean;
    variant: 'normal' | 'stattrak' | 'souvenir';
  }>;
}

interface TrackerFormData {
  buy_price: string;
  wear_value: string;
  wear: string;
  notes: string;
  bought_at: string;
}

interface ResellTrackerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: TrackerFormData) => Promise<void> | void;
  skin: Skin;
  initialData?: TrackerFormData;
  mode?: 'add' | 'edit';
  loading?: boolean;
  errorMsg?: string;
  successMsg?: string;
  floatInputFullWidth?: boolean;
}

const wearRanges: Record<string, WearRange> = {
  FN: { min: 0.00, max: 0.07, label: 'Factory New (FN)' },
  MW: { min: 0.07, max: 0.15, label: 'Minimal Wear (MW)' },
  FT: { min: 0.15, max: 0.38, label: 'Field-Tested (FT)' },
  WW: { min: 0.38, max: 0.45, label: 'Well-Worn (WW)' },
  BS: { min: 0.45, max: 1.00, label: 'Battle-Scarred (BS)' },
};

function getWearFromFloat(floatValue: number): string {
  for (const [wear, range] of Object.entries(wearRanges)) {
    if (floatValue >= range.min && floatValue <= range.max) {
      return wear;
    }
  }
  return '';
}

// Custom Date Picker Component
function CustomDatePicker({ value, onChange }: { value: string; onChange: (date: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    const date = value ? new Date(value) : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    onChange(formatDate(newDate));
    setIsOpen(false);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const today = new Date();
  const isToday = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toDateString() === selectedDate.toDateString();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-dark-bg-secondary text-dark-text-primary border border-dark-border-primary/40 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-accent-primary focus:outline-none shadow-sm pr-12 cursor-pointer hover:border-accent-primary/60 transition-colors duration-200 text-left"
      >
        {value || 'Select date'}
        <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center p-1 rounded-md hover:bg-accent-primary/10 transition-colors duration-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 text-dark-text-muted group-hover:text-accent-primary transition-colors duration-200"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <div className="glass-card border border-dark-border-primary/40 rounded-xl p-4 shadow-dark-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-accent-primary/10 text-dark-text-muted hover:text-accent-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-lg font-bold text-dark-text-primary">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-accent-primary/10 text-dark-text-muted hover:text-accent-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-dark-text-muted py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }, (_, i) => (
                <div key={`empty-${i}`} className="h-10" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const isTodayDate = isToday(day);
                const isSelectedDate = isSelected(day);
                const isFuture = new Date(currentDate.getFullYear(), currentDate.getMonth(), day) > new Date(today.getFullYear(), today.getMonth(), today.getDate());
                
                return (
                  <button
                    key={day}
                    onClick={() => handleDateSelect(day)}
                                         disabled={isFuture}
                     className={`h-10 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                       isSelectedDate
                         ? 'bg-accent-primary text-white shadow-lg scale-105'
                         : isTodayDate
                         ? 'bg-accent-secondary text-white'
                         : isFuture
                         ? 'text-dark-text-muted opacity-50 cursor-not-allowed'
                         : 'text-dark-text-primary hover:bg-accent-primary/10 hover:scale-105'
                     }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResellTrackerModal({
  open,
  onClose,
  onSubmit,
  skin,
  initialData,
  mode = 'edit',
  loading = false,
  errorMsg = '',
  successMsg = '',
  floatInputFullWidth = true,
}: ResellTrackerModalProps) {
  const [formData, setFormData] = useState<TrackerFormData>(initialData || {
    buy_price: '',
    wear_value: '',
    wear: '',
    notes: '',
    bought_at: '',
  });
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  useEffect(() => {
    setFormData(initialData || {
      buy_price: '',
      wear_value: '',
      wear: '',
      notes: '',
      bought_at: '',
    });
    setLocalError('');
    setLocalSuccess('');
  }, [open, initialData]);

  const handleWearSelect = (wear: string) => {
    setFormData(prev => ({ ...prev, wear, wear_value: '' }));
  };
  const handleFloatChange = (value: string) => {
    setFormData(prev => ({ ...prev, wear_value: value }));
    if (value) {
      const float = parseFloat(value);
      if (!isNaN(float) && float >= 0 && float <= 1) {
        const detectedWear = getWearFromFloat(float);
        setFormData(prev => ({ ...prev, wear: detectedWear }));
      }
    }
  };

  const getPriceForWear = (wear: string, variant: 'normal' | 'stattrak' | 'souvenir' = 'normal'): number | null => {
    if (!skin?.wears_extended) return null;
    const wearEntry = skin.wears_extended.find(w => w.wear === wear && w.enabled && w.variant === variant);
    return wearEntry?.price || null;
  };

  const handleSubmit = async () => {
    setLocalError('');
    setLocalSuccess('');
    const price = parseFloat(formData.buy_price);
    let floatValue = formData.wear_value ? parseFloat(formData.wear_value) : null;
    let wearToSave = formData.wear;
    if (formData.wear_value) {
      const floatValueNum = parseFloat(formData.wear_value);
      if (isNaN(floatValueNum)) {
        setLocalError('Please enter a valid float value.');
        return;
      }
      const detectedWear = getWearFromFloat(floatValueNum);
      if (!detectedWear) {
        setLocalError('This float is not possible for this skin.');
        return;
      }
      const enabled = skin.wears_extended?.find(w => w.wear === detectedWear && w.enabled);
      if (!enabled) {
        setLocalError('This float is not possible for this skin.');
        return;
      }
      wearToSave = detectedWear;
    }
    if (!wearToSave) {
      setLocalError('Please select a wear or enter a float value.');
      return;
    }
    if (!formData.bought_at) {
      setLocalError('Please select the date you bought this skin.');
      return;
    }
    if (!formData.buy_price || isNaN(price)) {
      setLocalError('Please enter a valid buy price.');
      return;
    }
    await onSubmit({ ...formData, wear: wearToSave });
    setLocalSuccess(mode === 'add' ? 'Tracker added successfully!' : 'Tracker updated successfully!');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 md:p-4">
      <div className="glass-card w-full h-full max-w-md md:h-auto md:p-8 p-0 flex flex-col md:justify-center md:mx-auto shadow-dark-lg border border-dark-border-primary/60 rounded-2xl overflow-y-auto">
        {/* Sticky close button for mobile */}
        <div className="flex justify-between items-center mb-4 sticky top-0 z-10 p-4 md:p-0 rounded-t-2xl md:rounded-none">
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent tracking-tight">
            {mode === 'add' ? 'Add Tracker' : 'Edit Tracker'}
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full glass-card border border-dark-border-primary/40 text-dark-text-muted hover:text-accent-error hover:bg-accent-error/10 text-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-error"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="flex items-center mb-6 px-4 md:px-0">
          <img
            src={skin.image}
            alt={skin.name}
            className="w-16 h-16 object-contain mr-3 rounded-xl border border-dark-border-primary/40 bg-dark-bg-tertiary"
          />
          <div>
            <div className="font-bold text-dark-text-primary text-lg">{skin.name}</div>
            <div className="text-sm text-dark-text-muted">{mode === 'add' ? 'Add to your tracker' : 'Edit your tracker'}</div>
          </div>
        </div>
        {(successMsg || localSuccess) && (
          <div className="mb-4 p-3 bg-accent-success/20 text-accent-success rounded-lg mx-4 md:mx-0 font-semibold text-center">{successMsg || localSuccess}</div>
        )}
        {(errorMsg || localError) && (
          <div className="mb-4 p-3 bg-accent-error/20 text-accent-error rounded-lg mx-4 md:mx-0 font-semibold text-center">{errorMsg || localError}</div>
        )}
        <div className="space-y-6 px-4 md:px-0">
          <div>
            <label className="block font-semibold mb-2 text-dark-text-primary text-base">Wear Selection <span className="text-accent-error">*</span></label>
            <div className="space-y-4 mb-3 pb-2">
              {Object.entries(wearRanges).map(([wear, range]) => {
                const variants = ['normal', 'stattrak', 'souvenir'] as const;
                const wearVariants = variants.map(variant => {
                  const entry = skin.wears_extended?.find(w => w.wear === wear && w.enabled && w.variant === variant);
                  return { variant, entry };
                }).filter(v => v.entry);

                if (wearVariants.length === 0) return null;

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
                  <div key={wear} className="flex flex-col gap-2">
                    <div className="text-sm font-medium text-dark-text-secondary">{wear} ({range.min.toFixed(2)}-{range.max.toFixed(2)})</div>
                    <div className="grid grid-cols-3 gap-2">
                      {wearVariants.map(({ variant, entry }) => (
                        <button
                          key={`${wear}-${variant}`}
                          type="button"
                          onClick={() => handleWearSelect(wear)}
                          className={`p-3 text-sm rounded-lg border font-bold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-primary flex flex-col items-center justify-center gap-1 ${
                            formData.wear === wear
                              ? 'bg-accent-primary text-white border-accent-primary shadow-lg scale-105'
                              : 'bg-dark-bg-secondary text-dark-text-primary border-dark-border-primary/40 hover:bg-accent-primary/10 hover:scale-105'
                          }`}
                        >
                          <div className={`font-bold ${variantColors[variant]}`}>
                            {variantLabels[variant] || 'Normal'}
                          </div>
                          <div className="text-xs opacity-75">
                            ${entry!.price}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-dark-text-muted mb-2">Or enter exact float value:</div>
            <input
              type="number"
              step="0.0001"
              min="0"
              max="1"
              value={formData.wear_value}
              onChange={e => handleFloatChange(e.target.value)}
              className={`${floatInputFullWidth ? 'w-full' : 'w-32'} bg-dark-bg-secondary text-dark-text-primary border border-dark-border-primary/40 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-accent-primary focus:outline-none shadow-sm`}
              placeholder="0.00 - 1.00"
            />
            {formData.wear_value && (() => {
              const float = Number(formData.wear_value);
              if (typeof float !== 'number' || isNaN(float) || float < 0 || float > 1) return null;
              const detectedWear = getWearFromFloat(float);
              if (!detectedWear) return null;
              const enabled = skin.wears_extended?.find(w => w.wear === detectedWear && w.enabled);
              if (!enabled) {
                return <div className="text-xs text-accent-error mt-1">This float is not possible for this skin.</div>;
              }
              return null;
            })()}
            {formData.wear && (
              <div className="mt-2 text-sm text-accent-primary font-semibold">
                Selected: {wearRanges[formData.wear as keyof typeof wearRanges]?.label}
                {skin.wears_extended && (
                  <div className="mt-1 space-y-1">
                    {['normal', 'stattrak', 'souvenir'].map(variant => {
                      const entry = skin.wears_extended!.find(w => w.wear === formData.wear && w.enabled && w.variant === variant);
                      if (!entry) return null;
                      const variantLabels = { normal: 'Normal', stattrak: 'StatTrak', souvenir: 'Souvenir' };
                      const variantColors = { normal: 'text-dark-text-primary', stattrak: 'text-orange-400', souvenir: 'text-yellow-400' };
                      return (
                        <div key={variant} className={`text-xs ${variantColors[variant as keyof typeof variantColors]}`}>
                          {variantLabels[variant as keyof typeof variantLabels]}: ${entry.price}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="block font-semibold mb-2 text-dark-text-primary text-base">Bought At <span className="text-accent-error">*</span></label>
            <CustomDatePicker
              value={formData.bought_at}
              onChange={(date) => setFormData(prev => ({ ...prev, bought_at: date }))}
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-dark-text-primary text-base">Buy Price <span className="text-accent-error">*</span></label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.buy_price}
              onChange={e => setFormData(prev => ({ ...prev, buy_price: e.target.value }))}
              className="w-full bg-dark-bg-secondary text-dark-text-primary border border-dark-border-primary/40 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-accent-primary focus:outline-none shadow-sm"
              placeholder="Enter buy price"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-dark-text-primary text-base">Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full bg-dark-bg-secondary text-dark-text-primary border border-dark-border-primary/40 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-accent-primary focus:outline-none shadow-sm resize-none"
              rows={3}
              placeholder="Add notes about your purchase..."
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-accent-primary text-white py-3 px-4 rounded-xl font-bold text-base shadow-lg hover:bg-accent-primary/90 hover:scale-105 transition-all duration-200 disabled:opacity-50 mt-2 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2"
          >
            {loading ? (mode === 'add' ? 'Adding...' : 'Saving...') : (mode === 'add' ? 'Add to Tracker' : 'Update Tracker')}
          </button>
        </div>
      </div>
    </div>
  );
} 