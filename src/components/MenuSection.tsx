import React, { useState, useMemo } from 'react';
import { Plus, Check, Search, Filter } from 'lucide-react';
import { MENU_ITEMS, POPULAR_ITEMS } from '../data/cafeData';
import { MenuItem } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

interface MenuSectionProps {
  onAddToCart: (item: MenuItem) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ onAddToCart }) => {
  const [activeTab, setActiveTab] = useState<string>('popular');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedItemId, setAddedItemId] = useState<string | null>(null);

  const categories = [
    { id: 'popular', label: 'Bestsellers' },
    { id: 'all', label: 'Full Menu' },
    { id: 'Coffee', label: 'Specialty Coffee' },
    { id: 'Non-Coffee', label: 'Beverages' },
    { id: 'Food', label: 'Sandwiches & Savory' },
    { id: 'Dessert', label: 'Desserts' },
    { id: 'Bakery', label: 'Bakery' },
  ];

  const filteredItems = useMemo(() => {
    let items = MENU_ITEMS;
    if (activeTab === 'popular') {
      items = POPULAR_ITEMS;
    } else if (activeTab !== 'all') {
      items = MENU_ITEMS.filter((item) => item.category === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    return items;
  }, [activeTab, searchQuery]);

  const handleAdd = (item: MenuItem) => {
    onAddToCart(item);
    setAddedItemId(item.id);
    setTimeout(() => {
      setAddedItemId(null);
    }, 1200);
  };

  return (
    <section id="menu" className="py-20 lg:py-28 bg-[#FFF8EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="text-xs font-medium text-[#C96F4A] uppercase tracking-widest mb-3">
              Handcrafted With Care
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3B241A] tracking-tight">
              {activeTab === 'popular' ? 'Popular Menu Favorites' : 'The Café Menu'}
            </h2>
            <p className="text-sm sm:text-base text-[#3B241A]/75 mt-3 max-w-xl">
              From our smooth Spanish Latte to oven-warm Lotus Biscoff cheesecake, every recipe is dialed in for perfection.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3B241A]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coffee, croissants..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white rounded-xl border border-[#3B241A]/15 focus:outline-hidden focus:border-[#3B241A] transition-colors text-[#3B241A] placeholder:text-[#3B241A]/40 shadow-xs"
            />
          </div>
        </div>

        {/* Filter Tabs (Interactive Segmented Control per Design Skill) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                className={`px-4 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#3B241A] text-[#FFF8EE] shadow-sm'
                    : 'bg-[#F5ECD9]/80 text-[#3B241A]/80 hover:bg-[#F5ECD9] hover:text-[#3B241A]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center bg-[#F5ECD9]/30 rounded-2xl border border-dashed border-[#3B241A]/20">
            <p className="text-sm text-[#3B241A]/70 mb-2">No menu items match your search.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveTab('popular');
              }}
              className="text-xs font-semibold text-[#C96F4A] hover:underline cursor-pointer"
            >
              Reset filter and show bestsellers
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredItems.map((item) => {
              const isAdded = addedItemId === item.id;
              return (
                <article
                  key={item.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-[#3B241A]/10 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Visual Card Image */}
                    <div className="relative overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        aspectRatioClass="aspect-[16/11]"
                        className="group-hover:scale-105 transition-transform duration-500"
                        fallbackTitle={item.name}
                      />

                      {/* Clean quiet category indicator */}
                      <div className="absolute top-3 left-3 bg-[#3B241A]/85 backdrop-blur-xs text-[#FFF8EE] px-2.5 py-1 rounded-md text-[10px] font-medium tracking-wide">
                        {item.category}
                      </div>

                      {item.isPopular && (
                        <div className="absolute top-3 right-3 bg-[#C96F4A] text-white px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide">
                          Bestseller
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-serif text-lg font-bold text-[#3B241A] group-hover:text-[#C96F4A] transition-colors">
                          {item.name}
                        </h3>
                        <span className="font-serif text-base font-bold text-[#3B241A] tabular-nums shrink-0">
                          ₹{item.price}
                        </span>
                      </div>

                      <p className="text-xs text-[#3B241A]/70 line-clamp-2 leading-relaxed mb-4">
                        {item.description}
                      </p>

                      {/* Quiet metadata line */}
                      <div className="flex items-center gap-2 text-[11px] text-[#3B241A]/60">
                        <span>{item.dietary || 'Vegetarian'}</span>
                        {item.tags && item.tags.length > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{item.tags[0]}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Add to Bag Action Button */}
                  <div className="px-5 pb-5 pt-0">
                    <button
                      type="button"
                      onClick={() => handleAdd(item)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                        isAdded
                          ? 'bg-[#87986A] text-white'
                          : 'bg-[#F5ECD9] hover:bg-[#3B241A] text-[#3B241A] hover:text-[#FFF8EE]'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added to Order Bag</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Order · ₹{item.price}</span>
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom Menu Note */}
        <div className="mt-12 text-center text-xs text-[#3B241A]/60">
          <span>All prices in Indian Rupees (₹) · Taxes inclusive · Dairy-free oat and almond milk available upon request</span>
        </div>
      </div>
    </section>
  );
};
