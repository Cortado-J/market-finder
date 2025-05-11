import React, { useState, useEffect } from 'react';
import { Market } from '../types/Market';

interface MarketEditFormProps {
  market: Market;
  onSave: (updatedMarketData: Partial<Market>) => Promise<void>;
  onCancel: () => void;
  isDebugMode?: boolean;
}

// Define which fields are editable
type EditableMarketFields = Pick<
  Market,
  | 'name'
  | 'description'
  | 'address'
  | 'postcode'
  | 'website_url'
  | 'opening_hours' // Note: Complex format, user needs to be careful
>;

export function MarketEditForm({ market, onSave, onCancel, isDebugMode = false }: MarketEditFormProps) {
  const [formData, setFormData] = useState<EditableMarketFields>(() => {
    // Initialize form data with only the editable fields from the market prop
    return {
      name: market.name || '',
      description: market.description || '',
      address: market.address || '',
      postcode: market.postcode || '',
      website_url: market.website_url || '',
      opening_hours: market.opening_hours || '',
    };
  });

  useEffect(() => {
    // If the market prop changes, reset the form data
    // This ensures the form updates if the user navigates directly between edit views
    // for different markets (though current app flow doesn't do this)
    setFormData({
      name: market.name || '',
      description: market.description || '',
      address: market.address || '',
      postcode: market.postcode || '',
      website_url: market.website_url || '',
      opening_hours: market.opening_hours || '',
    });
  }, [market]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Construct the object for saving: only include changed fields, or all editable fields
    // For simplicity, we'll send all editable fields. Supabase update can handle partials.
    // Add market_id for Supabase to identify the record.
    const updatedMarketData: Partial<Market> = {
      market_id: market.market_id, // Crucial for Supabase update
      ...formData,
    };
    await onSave(updatedMarketData);
  };

  const inputStyle = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const textareaStyle = `${inputStyle} min-h-[80px]`; // For textareas
  const labelStyle = "block text-sm font-medium text-gray-700";
  const fieldWrapperStyle = isDebugMode ? "mb-4 p-2 border border-dashed border-orange-500" : "mb-4";

  // Define field configuration for easier rendering
  const fields: Array<{ name: keyof EditableMarketFields; label: string; type?: string; isTextarea?: boolean }> = [
    { name: 'name', label: 'Market Name', type: 'text' },
    { name: 'description', label: 'Description', isTextarea: true },
    { name: 'address', label: 'Address', isTextarea: true },
    { name: 'postcode', label: 'Postcode', type: 'text' },
    { name: 'website_url', label: 'Website URL', type: 'url' },
    { name: 'opening_hours', label: 'Opening Hours (OSM format)', isTextarea: true },
  ];

  return (
    <div className="p-4 max-w-2xl mx-auto bg-gray-50" style={{ height: '100vh', overflowY: 'auto' }}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Edit: {market.name}</h2>

        {fields.map(field => (
          <div key={field.name} className={fieldWrapperStyle}>
            <label htmlFor={field.name} className={labelStyle}>
              {field.label}
            </label>
            {field.isTextarea ? (
              <textarea
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                className={textareaStyle}
              />
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type || 'text'}
                value={formData[field.name] || ''}
                onChange={handleChange}
                className={inputStyle}
              />
            )}
          </div>
        ))}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
