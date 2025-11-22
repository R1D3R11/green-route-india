import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, LocateFixed, Loader2 } from './Icons';

interface AddressAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  iconType: 'origin' | 'destination';
  city: string;
}

interface Suggestion {
  display_name: string;
  place_id: number;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  iconType,
  city 
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce logic for fetching suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (value.length > 2 && showSuggestions) {
        setIsLoading(true);
        try {
          // Using OpenStreetMap Nominatim API (Free, no key required for low volume)
          // Restricted to India (countrycodes=in) and biased towards the selected city
          const query = `${value}, ${city}`;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`
          );
          const data = await response.json();
          setSuggestions(data);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setIsLoading(false);
      }
    }, 400); 

    return () => clearTimeout(timer);
  }, [value, city, showSuggestions]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (suggestion: Suggestion) => {
    // Robust Parsing: 
    // Typically splits by comma. If the first part is a number (house number), take the first two parts.
    const parts = suggestion.display_name.split(',').map(p => p.trim());
    let name = parts[0];
    
    // If first part is very short (likely a number) or empty, append the second part for context
    if (parts.length > 1 && (name.length < 3 || !isNaN(Number(name)))) {
      name = `${parts[0]}, ${parts[1]}`;
    }
    
    onChange(name);
    setShowSuggestions(false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Reverse geocode coordinates to address
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          
          if (data && data.display_name) {
             const parts = data.display_name.split(',').map((p: string) => p.trim());
             let name = parts[0];
             if (parts.length > 1 && (name.length < 3 || !isNaN(Number(name)))) {
                name = `${parts[0]}, ${parts[1]}`;
             }
             onChange(name);
          }
        } catch (err) {
          console.error("Reverse geocoding failed", err);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error("Geolocation error", err);
        setIsLocating(false);
        if (err.code === 1) {
          alert("Please allow location access to use this feature.");
        }
      }
    );
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className={`absolute left-4 top-3.5 ${iconType === 'origin' ? 'text-emerald-500' : 'text-red-400'}`}>
        {iconType === 'origin' ? <Navigation className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
      </div>
      
      <input 
        type="text" 
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        required
      />
      
      {/* Use Current Location Button */}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={isLocating}
        className="absolute right-3 top-2.5 p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
        title="Use my current location"
      >
        {isLocating ? (
          <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
        ) : (
          <LocateFixed className="w-5 h-5" />
        )}
      </button>

      {/* Suggestions Dropdown */}
      {showSuggestions && value.length > 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in duration-200">
          {isLoading ? (
            <div className="px-4 py-6 text-center text-gray-400 text-sm flex flex-col items-center justify-center gap-2">
               <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
               <span>Finding locations...</span>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((s) => (
              <div 
                key={s.place_id}
                className="px-4 py-3 hover:bg-emerald-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0 transition-colors group flex items-start gap-2"
                onClick={() => handleSelect(s)}
              >
                <MapPin className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                    <div className="font-medium text-gray-900 group-hover:text-emerald-800 leading-tight">
                    {s.display_name.split(',')[0]}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                    {s.display_name.split(',').slice(1).join(', ')}
                    </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-gray-400 text-sm flex flex-col items-center justify-center gap-2">
              <Search className="w-5 h-5 opacity-20" />
              <span>No results found</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
