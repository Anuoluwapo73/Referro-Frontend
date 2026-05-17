import React, { useState, useRef, useEffect, useCallback } from 'react';
import { placesApi, PlaceSuggestion, GeocodeResult } from '../../api/places.api';

export interface AddressValue {
    address: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    placeId: string;
}

interface AddressInputProps {
    label?: string;
    value?: string;
    onChange?: (value: AddressValue) => void;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
    id?: string;
}

/**
 * AddressInput component with Google Places autocomplete and geocoding.
 * Integrates with the backend /api/places endpoints.
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5
 */
const AddressInput: React.FC<AddressInputProps> = ({
    label,
    value = '',
    onChange,
    error,
    placeholder = 'Enter an address...',
    disabled = false,
    id,
}) => {
    const inputId = id || 'address-input';
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [geocodeError, setGeocodeError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync external value changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = useCallback(async (query: string) => {
        if (query.trim().length < 3) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await placesApi.autocomplete(query);
            setSuggestions(response.results);
            setIsOpen(response.results.length > 0);
        } catch {
            setSuggestions([]);
            setIsOpen(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setGeocodeError(null);
        setActiveIndex(-1);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(newValue), 300);
    };

    const handleSelectSuggestion = async (suggestion: PlaceSuggestion) => {
        setInputValue(suggestion.description);
        setSuggestions([]);
        setIsOpen(false);
        setGeocodeError(null);
        setIsLoading(true);

        try {
            const result: GeocodeResult = await placesApi.geocode(suggestion.placeId);
            onChange?.({
                address: result.address,
                city: result.city,
                state: result.state,
                latitude: result.latitude,
                longitude: result.longitude,
                placeId: result.placeId,
            });
        } catch {
            setGeocodeError('Failed to get location coordinates. Please try a different address.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            handleSelectSuggestion(suggestions[activeIndex]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setActiveIndex(-1);
        }
    };

    const displayError = error || geocodeError;

    const baseInputStyles =
        'block w-full rounded-lg border px-4 py-2 text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1';
    const stateStyles = displayError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500';

    return (
        <div className="w-full" ref={containerRef}>
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    id={inputId}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled || isLoading}
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-controls={isOpen ? `${inputId}-suggestions` : undefined}
                    aria-activedescendant={activeIndex >= 0 ? `${inputId}-option-${activeIndex}` : undefined}
                    aria-invalid={displayError ? 'true' : 'false'}
                    aria-describedby={displayError ? `${inputId}-error` : undefined}
                    className={`${baseInputStyles} ${stateStyles} ${isLoading ? 'pr-10' : ''}`}
                />
                {isLoading && (
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <svg
                            className="animate-spin h-4 w-4 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                    </div>
                )}
                {isOpen && suggestions.length > 0 && (
                    <ul
                        id={`${inputId}-suggestions`}
                        role="listbox"
                        aria-label="Address suggestions"
                        className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
                    >
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={suggestion.placeId}
                                id={`${inputId}-option-${index}`}
                                role="option"
                                aria-selected={index === activeIndex}
                                onMouseDown={() => handleSelectSuggestion(suggestion)}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={`px-4 py-2 cursor-pointer text-sm ${
                                    index === activeIndex
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <span className="font-medium">{suggestion.mainText}</span>
                                {suggestion.secondaryText && (
                                    <span className="text-gray-500 ml-1">{suggestion.secondaryText}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {displayError && (
                <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600" role="alert">
                    {displayError}
                </p>
            )}
        </div>
    );
};

export default AddressInput;
