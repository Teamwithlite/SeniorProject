// app/components/ComponentFilter.tsx
import React, { useState } from 'react';
import { Search, Filter, Plus, Minus, X } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';

// Define categories for better organization
const COMPONENT_CATEGORIES = [
  {
    name: 'Layout Components',
    description: 'Major structural elements of a page',
    types: [
      { id: 'hero', label: 'Hero Sections' },
      { id: 'feature-section', label: 'Feature Sections' },
      { id: 'cta-section', label: 'Call-to-Action' },
      { id: 'headers', label: 'Headers' },
      { id: 'navigation', label: 'Navigation' },
      { id: 'footers', label: 'Footers' },
    ]
  },
  {
    name: 'Content Components',
    description: 'Elements that present content to users',
    types: [
      { id: 'cards', label: 'Cards' },
      { id: 'carousel', label: 'Carousels & Sliders' },
      { id: 'product', label: 'Product Components' },
      { id: 'testimonial', label: 'Testimonials' },
      { id: 'image-gallery', label: 'Image Galleries' },
      { id: 'rich-media', label: 'Rich Media' },
    ]
  },
  {
    name: 'Interactive Elements',
    description: 'Components that users can interact with',
    types: [
      { id: 'buttons', label: 'Buttons' },
      { id: 'forms', label: 'Forms' },
      { id: 'inputs', label: 'Input Fields' },
      { id: 'modals', label: 'Modals & Dialogs' },
      { id: 'toggles', label: 'Toggles & Switches' },
    ]
  },
  {
    name: 'Basic Elements',
    description: 'Fundamental page components',
    types: [
      { id: 'text', label: 'Text Components' },
      { id: 'links', label: 'Links' },
      { id: 'lists', label: 'Lists' },
      { id: 'tables', label: 'Tables & Grids' }, 
      { id: 'images', label: 'Images' },
      { id: 'icons', label: 'Icons' },
      { id: 'dividers', label: 'Dividers' },
      { id: 'badges', label: 'Badges' },
      { id: 'tooltips', label: 'Tooltips' },
      { id: 'alerts', label: 'Alerts & Notifications' },
      { id: 'progress', label: 'Progress Bars' },
    ]
  }
];

// Flattened list for searching
const ALL_COMPONENT_TYPES = COMPONENT_CATEGORIES.flatMap(category => category.types);

interface ComponentFilterProps {
  selectedTypes: string[];
  onChange: (types: string[]) => void;
  onSearchChange?: (searchTerm: string) => void;
}

export const ComponentFilter: React.FC<ComponentFilterProps> = ({
  selectedTypes,
  onChange,
  onSearchChange
}) => {
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };
  
  const toggleComponentType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      onChange(selectedTypes.filter(id => id !== typeId));
    } else {
      onChange([...selectedTypes, typeId]);
    }
  };
  
  const toggleCategory = (categoryName: string) => {
    if (activeCategory === categoryName) {
      setActiveCategory(null);
    } else {
      setActiveCategory(categoryName);
    }
  };
  
  const selectAllInCategory = (categoryTypes: { id: string, label: string }[]) => {
    const categoryTypeIds = categoryTypes.map(t => t.id);
    const otherSelectedTypes = selectedTypes.filter(id => !categoryTypeIds.includes(id));
    onChange([...otherSelectedTypes, ...categoryTypeIds]);
  };
  
  const clearAllInCategory = (categoryTypes: { id: string, label: string }[]) => {
    const categoryTypeIds = categoryTypes.map(t => t.id);
    onChange(selectedTypes.filter(id => !categoryTypeIds.includes(id)));
  };
  
  const clearAllFilters = () => {
    onChange([]);
    setSearchTerm('');
    if (onSearchChange) {
      onSearchChange('');
    }
  };
  
  // Filter components by search term
  const filteredCategories = searchTerm 
    ? [{ 
        name: 'Search Results', 
        description: `Components matching "${searchTerm}"`,
        types: ALL_COMPONENT_TYPES.filter(type => 
          type.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          type.id.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }]
    : COMPONENT_CATEGORIES;

  return (
    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium dark:text-gray-200 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter Components
          {selectedTypes.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedTypes.length} selected
            </Badge>
          )}
        </h3>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs h-7 px-2 dark:border-gray-600"
          >
            {expanded ? 'Collapse' : 'Expand'} Filters
          </Button>
          
          {selectedTypes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs h-7 px-2 text-gray-500 dark:text-gray-400"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Search bar always visible */}
      <div className="relative mb-3">
        <Input
          type="text"
          placeholder="Search components..."
          className="pl-8 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setSearchTerm('');
              if (onSearchChange) {
                onSearchChange('');
              }
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Selected types display as badges */}
      {selectedTypes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTypes.map(typeId => {
            const type = ALL_COMPONENT_TYPES.find(t => t.id === typeId);
            return type ? (
              <Badge
                key={typeId}
                variant="secondary"
                className="pl-2 pr-1 py-1 flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-gray-700 dark:text-blue-400 dark:hover:bg-gray-600"
              >
                {type.label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 rounded-full"
                  onClick={() => toggleComponentType(typeId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null;
          })}
        </div>
      )}

      {/* Expanded filter view */}
      {expanded && (
        <div className="mt-4 space-y-4">
          {filteredCategories.map(category => (
            <div key={category.name} className="border rounded-md p-3 dark:border-gray-700 bg-white dark:bg-gray-750">
              <div 
                className="flex justify-between items-center cursor-pointer" 
                onClick={() => toggleCategory(category.name)}
              >
                <div>
                  <h4 className="text-sm font-medium dark:text-gray-200">{category.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{category.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Only show these buttons if there are types to select */}
                  {category.types.length > 0 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAllInCategory(category.types);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAllInCategory(category.types);
                        }}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Show component types when category is active or when searching */}
              {(activeCategory === category.name || searchTerm) && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                  {category.types.map(type => (
                    <div
                      key={type.id}
                      className={`flex items-center space-x-2 p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedTypes.includes(type.id)
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : ''
                      }`}
                    >
                      <Checkbox
                        id={`filter-${type.id}`}
                        checked={selectedTypes.includes(type.id)}
                        onCheckedChange={() => toggleComponentType(type.id)}
                        className={selectedTypes.includes(type.id) ? 'text-blue-600' : ''}
                      />
                      <Label
                        htmlFor={`filter-${type.id}`}
                        className={`text-sm ${
                          selectedTypes.includes(type.id)
                            ? 'font-medium text-blue-700 dark:text-blue-400'
                            : 'dark:text-gray-300'
                        }`}
                      >
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};