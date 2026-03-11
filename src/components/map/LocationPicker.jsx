import React, { useState, useCallback, useEffect, useRef } from "react";
import { debounce } from "lodash";

const LocationPicker = ({ label, onSelectLocation, selectedLocation, selectedName = null, placeholder = "Keresés (pl. Bratislava, Košice...)", icon = "📍" }) => {
  const [mode, setMode] = useState("idle");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [locationName, setLocationName] = useState(selectedName || "");

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (selectedLocation && selectedLocation.length >= 2) {
      setMode("selected");
      if (!selectedName && !locationName) {
        reverseGeocode(selectedLocation[0], selectedLocation[1]);
      } else if (selectedName) {
        setLocationName(selectedName);
      }
    } else {
      setMode("idle");
      setLocationName("");
      setQuery("");
    }
  }, [selectedLocation, selectedName]);

  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?` + `format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`);

      if (response.ok) {
        const data = await response.json();
        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || data.display_name?.split(",")[0];
        setLocationName(city || `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      setLocationName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    }
  };

  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?` + `format=json&` + `q=${encodeURIComponent(searchQuery)}&` + `limit=8&` + `countrycodes=sk,cz,hu,at,pl&` + `addressdetails=1&` + `accept-language=sk,hu,en`);

        if (response.ok) {
          const data = await response.json();
          const formatted = data.map((item) => ({
            id: item.place_id,
            displayName: item.display_name,
            name: item.address?.city || item.address?.town || item.address?.village || item.display_name.split(",")[0],
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            type: item.type,
            country: item.address?.country,
            region: item.address?.state || item.address?.county,
          }));
          setSuggestions(formatted);
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [],
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setShowDropdown(true);

    if (value.trim()) {
      debouncedSearch(value);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setLocationName(suggestion.name);
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    setMode("selected");
    onSelectLocation([suggestion.lat, suggestion.lon], suggestion.name);
  };

  const handleEdit = () => {
    setMode("searching");
    setQuery("");
    setSuggestions([]);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleClear = () => {
    setMode("idle");
    setQuery("");
    setLocationName("");
    setSuggestions([]);
    setShowDropdown(false);
    onSelectLocation(null);
  };

  const handleCancel = () => {
    if (selectedLocation) {
      setMode("selected");
    } else {
      setMode("idle");
    }
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === "Escape") {
        handleCancel();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        handleCancel();
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        if (mode === "searching" && !selectedLocation) {
          setMode("idle");
        } else if (mode === "searching" && selectedLocation) {
          setMode("selected");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mode, selectedLocation]);

  if (mode === "selected" && selectedLocation) {
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <span>{icon}</span>
          {label}
        </label>

        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{locationName || "Kiválasztott hely"}</p>
                <p className="text-xs text-gray-500">
                  {selectedLocation[0].toFixed(5)}, {selectedLocation[1].toFixed(5)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={handleEdit} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Módosítás">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button onClick={handleClear} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Törlés">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
        <span>{icon}</span>
        {label}
      </label>

      <div className="relative">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setMode("searching");
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            placeholder={placeholder}
            className="w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-xl 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       text-sm transition-all"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />}

            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setSuggestions([]);
                  inputRef.current?.focus();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {mode === "searching" && selectedLocation && (
              <button onClick={handleCancel} className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" type="button">
                Mégsem
              </button>
            )}
          </div>
        </div>

        {showDropdown && (suggestions.length > 0 || isLoading || (query.length >= 2 && !isLoading)) && (
          <div ref={dropdownRef} className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
            {isLoading && suggestions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                Keresés...
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => {
                const isActive = index === selectedIndex;

                return (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className={`
                      w-full text-left px-4 py-3 transition-colors
                      ${isActive ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-gray-50 border-l-4 border-transparent"}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {/* Típus ikon */}
                      <div
                        className={`
                        w-8 h-8 rounded-lg flex items-center justify-center text-sm
                        ${suggestion.type === "city" || suggestion.type === "town" ? "bg-blue-100 text-blue-600" : suggestion.type === "village" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"}
                      `}
                      >
                        {suggestion.type === "city" || suggestion.type === "town" ? "🏙️" : suggestion.type === "village" ? "🏘️" : "📍"}
                      </div>

                      {/* Név és részletek */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{suggestion.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {suggestion.region && `${suggestion.region}, `}
                          {suggestion.country}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : query.length >= 2 && !isLoading ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">Nincs találat "{query}" kifejezésre</div>
            ) : null}
          </div>
        )}
      </div>

      {mode === "idle" && !selectedLocation && <p className="text-xs text-gray-400 mt-1">Kezdj el gépelni egy város vagy cím kereséshez</p>}
    </div>
  );
};

export default LocationPicker;
