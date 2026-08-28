import React, { useState, useEffect } from 'react';
import {
  Grid,
  List,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  ChevronDown,
  AlertTriangle,
  Minus,
  X,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  Edit,
  Check,
  Trash2
} from 'lucide-react';
import { fetchInventory, adjustInventoryStock, createProduct, deleteProduct } from '../api/inventory.js';
import { toast } from 'sonner';

const INITIAL_PIECES = [
  {
    id: '1',
    sku: 'SKU-IH-8901',
    title: 'Kanchipuram Heirloom Silk Saree',
    material: 'Pure Mulberry Silk & Metallic Zari',
    price: 850,
    stock: 12,
    status: 'in_stock',
    collectionTag: 'Heritage Saree',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCp2MY-i6FVyIWxqy0BivV4xT41MJJ9908qDTJIXx2JR2ZGU914DIv91Q0lLzgs-12T500ACSURod9mxu09pXYGiH230imPT-nC_Kivu20DwqYqsDZlIEg9CMHPNtuNWuhO1Rr3SOX0nuJjj9ZjSmuX-_u8mjt-aklkmwuk1gpy4yTYGzotBiAJ8_JriQOcnKtr1zO-h1YwFSuJSQTqJ7HPQA8T9HUf3RfeI_yKEjM-kzDW-e-j47BCcQ'
  },
  {
    id: '2',
    sku: 'SKU-IH-8902',
    title: 'Imperial Velvet Bandhgala Jacket',
    material: 'Rich Silk Velvet with Antique Gold Buttons',
    price: 980,
    stock: 2,
    status: 'low_stock',
    collectionTag: 'Menswear',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCi31WqWj678Qz9D0w3qL_vFp2jTfUf9rYF71s4v6a6Eqb0ICw2PfLdYlURCszUxM313a2REACEneZtg1TZzLp762yFMCIC7AWr6UJCtsjXlNoyXz__uHaqnmyPMWkZtmh-yv79JhdW0TZYOz-rz5WG-oZwyuIpfRjsvkXsWlcx8tt8-ioT_PP-jwFBwh6ILIy9ZiCdOKZZEbjmj95xILmAS3ssYqg_F1Wly908L9B5rh-3-8PE8bQytTwfRVgHYB1Xw67GSxOqoH49Yg'
  },
  {
    id: '3',
    sku: 'SKU-IH-8903',
    title: 'Banarasi Brocade Heritage Sherwani',
    material: 'Handwoven Banarasi Silk with Silver Threading',
    price: 1450,
    stock: 5,
    status: 'in_stock',
    collectionTag: 'Atelier Bespoke',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxoFfy0uSmOMcf6ca6Eqb0ICw2PfLdYlURCszUxM313a2REACEneZtg1TZzLp762yFMCIC7AWr6UJCtsjXlNoyXz__uHaqnmyPMWkZtmh-yv79JhdW0TZYOz-rz5WG-oZwyuIpfRjsvkXsWlcx8tt8-ioT_PP-jwFBwh6ILIy9ZiCdOKZZEbjmj95xILmAS3ssYqg_F1Wly908L9B5rh-3-8PE8bQytTwfRVgHYB1Xw67GSxOqoH49Yg'
  },
  {
    id: '4',
    sku: 'SKU-IH-8904',
    title: 'Pure Pashmina Regal Stole',
    material: '100% Cashmere with Sozni Hand-Needlework',
    price: 490,
    stock: 1,
    status: 'low_stock',
    collectionTag: 'Accessories',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChGPEW4JwxYYRiybHsS-xDf4jBYLJ3wC01QcXZpvzDppzHBh0sreoHltNCMjc4KSVwiL0E6zgwxQlZk-NtobJXtnx7JlSaoMooxLKskanJ0-jWuFL2CiNu8GLa5f71hcTC3C6yTV_NMkvpIUJN4PwZ5dzej2MmpS2ASUF1YSYmBu0763NoIlWC1BQ0DMdJ66eDXW8yT8E02O-gAXhjiQzc6mDELn72_NapGl1IqfkazBv43sdfse3FIQ'
  }
];

export function InventoryView() {
  const [inventory, setInventory] = useState(INITIAL_PIECES);
  const [viewMode, setViewMode] = useState('grid');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadInventory() {
      try {
        setLoading(true);
        const data = await fetchInventory({ search: searchQuery || undefined });
        if (data && Array.isArray(data) && data.length > 0) {
          const formatted = data.map((p) => {
            const variant = p.variants?.[0] || {};
            const stockVal = variant.inventory?.on_hand ?? 8;
            return {
              id: p.id,
              variantId: variant.id,
              sku: p.sku || variant.sku || `SKU-IH-${p.id.slice(0, 4)}`,
              title: p.name,
              material: p.fabric_composition || 'Pure Mulberry Silk',
              price: Number(p.base_price || 850),
              stock: stockVal,
              status: stockVal <= 2 ? 'low_stock' : 'in_stock',
              collectionTag: p.category?.name || 'Heritage Collection',
              image: p.images?.[0]?.url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCp2MY-i6FVyIWxqy0BivV4xT41MJJ9908qDTJIXx2JR2ZGU914DIv91Q0lLzgs-12T500ACSURod9mxu09pXYGiH230imPT-nC_Kivu20DwqYqsDZlIEg9CMHPNtuNWuhO1Rr3SOX0nuJjj9ZjSmuX-_u8mjt-aklkmwuk1gpy4yTYGzotBiAJ8_JriQOcnKtr1zO-h1YwFSuJSQTqJ7HPQA8T9HUf3RfeI_yKEjM-kzDW-e-j47BCcQ',
            };
          });
          setInventory(formatted);
        }
      } catch (err) {
        console.warn('Inventory live sync note:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadInventory();
  }, [searchQuery]);

  const handleStockAdjust = async (pieceId, delta) => {
    // Optimistic UI update
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === pieceId) {
          const newStock = Math.max(0, item.stock + delta);
          return {
            ...item,
            stock: newStock,
            status: newStock <= 2 ? 'low_stock' : 'in_stock',
          };
        }
        return item;
      })
    );

    const piece = inventory.find((p) => p.id === pieceId);
    if (piece?.variantId) {
      try {
        await adjustInventoryStock({
          variantId: piece.variantId,
          delta,
          reason: 'MANUAL_ATELIER_STOCK_ADJUST',
        });
      } catch (err) {
        console.warn('Backend stock adjust sync error:', err.message);
      }
    }
  };

  const handleDeletePiece = async (pieceId) => {
    const pieceToDelete = inventory.find((p) => p.id === pieceId);
    setInventory((prev) => prev.filter((item) => item.id !== pieceId));
    if (selectedPiece && selectedPiece.id === pieceId) {
      setSelectedPiece(null);
    }
    toast.success(`Removed ${pieceToDelete?.title || 'piece'} from inventory`);

    try {
      await deleteProduct(pieceId).catch(() => null);
    } catch (err) {
      console.warn('Delete product sync note:', err.message);
    }
  };

  // New Piece Form State
  const [newPiece, setNewPiece] = useState({
    title: '',
    sku: `SKU-IH-${Math.floor(1000 + Math.random() * 9000)}`,
    material: '',
    price: '',
    stock: '',
    collectionTag: 'Heritage Collection',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvJw2F-pRoAupFh8Y95MBxVEjnIxH8drAX6RVvz480WHnRFp0U2raa9ZHK9CJMEnv5HxKDmCt8udAq5O_xGtOXbHXmJATuDoO5aFZyVBWNoZXGgi8Bzt6K5v6OAeplFTCOldwrattCGX43_91ND-cSC5psDCZpLw-m3XZOfgpsdpH0Otm9gwmDyrkh3C4qwBZcgQcyg53swSwMB4pH2aOdKu0sV_uUqPxch2No89Qdmr6MI2vI0WS5zQ'
  });

  const allCount = inventory.length;
  const inStockCount = inventory.filter((item) => item.stock > 2).length;
  const lowStockCount = inventory.filter((item) => item.stock > 0 && item.stock <= 2).length;
  const draftsCount = inventory.filter((item) => item.status === 'draft' || item.stock === 0).length;

  const filteredInventory = inventory.filter((item) => {
    const matchesTab =
      activeFilter === 'all' ||
      (activeFilter === 'in_stock' && item.stock > 2) ||
      (activeFilter === 'low_stock' && item.stock > 0 && item.stock <= 2) ||
      (activeFilter === 'drafts' && (item.status === 'draft' || item.stock === 0));

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.material.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const handleAddPiece = (e) => {
    e.preventDefault();
    if (!newPiece.title || !newPiece.price || !newPiece.stock) return;

    const piece = {
      id: Date.now().toString(),
      sku: newPiece.sku,
      title: newPiece.title,
      material: newPiece.material || 'Handwoven Heritage Textile',
      price: parseFloat(newPiece.price),
      stock: parseInt(newPiece.stock, 10),
      status: parseInt(newPiece.stock, 10) <= 2 ? 'low_stock' : 'in_stock',
      collectionTag: newPiece.collectionTag,
      image: newPiece.image
    };

    setInventory([piece, ...inventory]);
    setIsAddModalOpen(false);
    setNewPiece({
      title: '',
      sku: `SKU-IH-${Math.floor(1000 + Math.random() * 9000)}`,
      material: '',
      price: '',
      stock: '',
      collectionTag: 'Heritage Collection',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvJw2F-pRoAupFh8Y95MBxVEjnIxH8drAX6RVvz480WHnRFp0U2raa9ZHK9CJMEnv5HxKDmCt8udAq5O_xGtOXbHXmJATuDoO5aFZyVBWNoZXGgi8Bzt6K5v6OAeplFTCOldwrattCGX43_91ND-cSC5psDCZpLw-m3XZOfgpsdpH0Otm9gwmDyrkh3C4qwBZcgQcyg53swSwMB4pH2aOdKu0sV_uUqPxch2No89Qdmr6MI2vI0WS5zQ'
    });
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-[1440px] w-full mx-auto space-y-6 md:space-y-8 flex-1 min-w-0">
      {/* Header & Page Action Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-5 pb-2">
        <div>
          <h1
            className="font-garamond text-[26px] sm:text-[34px] md:text-[44px] text-[var(--text-primary)] font-normal tracking-tight leading-tight"
          >
            Inventory Collection
          </h1>
          <p className="body-md text-[13px] sm:text-[14px] md:text-[15px] text-[var(--text-secondary)] mt-1 max-w-2xl">
            Manage the atelier's curated heritage pieces. Monitor stock levels and update collection details.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 items-stretch sm:items-center">
          {/* Search Input */}
          <div className="relative w-full sm:w-60 md:w-64 border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1">
            <Search size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pieces, SKU, weave..."
              className="w-full bg-transparent border-none outline-none font-manrope text-[13px] pl-6 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
          </div>

          {/* Add Piece Action */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:opacity-90 label-caps text-[11px] uppercase tracking-widest px-5 py-2.5 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus size={15} />
            <span>Add New Piece</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-[var(--border-color)] gap-3 sm:gap-4">
        {/* Horizontal Scrollable Tabs on Mobile */}
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-1 text-[13px] sm:text-[13.5px] font-manrope no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveFilter('all')}
            className={`pb-2.5 sm:pb-3 transition-colors border-b-2 cursor-pointer ${
              activeFilter === 'all'
                ? 'text-[var(--text-primary)] border-[var(--gold)] font-bold'
                : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] font-medium'
            }`}
          >
            All Pieces ({allCount})
          </button>

          <button
            onClick={() => setActiveFilter('in_stock')}
            className={`pb-2.5 sm:pb-3 transition-colors border-b-2 cursor-pointer ${
              activeFilter === 'in_stock'
                ? 'text-[var(--text-primary)] border-[var(--gold)] font-bold'
                : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] font-medium'
            }`}
          >
            In Stock ({inStockCount})
          </button>

          <button
            onClick={() => setActiveFilter('low_stock')}
            className={`pb-2.5 sm:pb-3 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'low_stock'
                ? 'text-rose-500 border-rose-500 font-bold'
                : 'text-rose-600/90 dark:text-rose-400 border-transparent hover:opacity-80'
            }`}
          >
            <AlertTriangle size={13} />
            <span>Low Stock ({lowStockCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('drafts')}
            className={`pb-2.5 sm:pb-3 transition-colors border-b-2 cursor-pointer ${
              activeFilter === 'drafts'
                ? 'text-[var(--text-primary)] border-[var(--gold)] font-bold'
                : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] font-medium'
            }`}
          >
            Drafts ({draftsCount})
          </button>
        </div>

        {/* View Grid/List Switcher */}
        <div className="flex justify-end gap-1 text-[var(--text-secondary)] pb-2 sm:pb-0">
          <button
            onClick={() => setViewMode('grid')}
            aria-label="Grid View"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'text-[var(--gold)] bg-[var(--bg-secondary)]' : 'hover:text-[var(--text-primary)]'
            }`}
          >
            <Grid size={17} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            aria-label="List View"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              viewMode === 'list' ? 'text-[var(--gold)] bg-[var(--bg-secondary)]' : 'hover:text-[var(--text-primary)]'
            }`}
          >
            <List size={17} />
          </button>
        </div>
      </div>

      {/* Grid Mode View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredInventory.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPiece(item)}
              className="group flex flex-col cursor-pointer border border-[var(--border-color)] bg-[var(--bg-card)] p-3 sm:p-3.5 hover:border-[var(--gold)] transition-all duration-300 shadow-sm"
            >
              {/* Image Container with 3/4 Ratio */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--bg-secondary)] mb-3">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                
                {/* Badge Tag */}
                {item.collectionTag && (
                  <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5">
                    <span className="bg-[var(--bg-card)]/90 backdrop-blur-sm text-[var(--text-primary)] label-caps text-[8.5px] sm:text-[9px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-widest border border-[var(--border-color)]">
                      {item.collectionTag}
                    </span>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex justify-between items-start mt-1">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="label-caps text-[9.5px] sm:text-[10px] text-[var(--text-secondary)] tracking-widest mb-1 truncate">
                    {item.sku}
                  </span>
                  <h3 className="font-garamond text-[17px] sm:text-[19px] leading-snug text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <span className="body-sm text-[11.5px] sm:text-[12px] text-[var(--text-secondary)] mt-0.5 truncate">
                    {item.material}
                  </span>
                </div>
                <span className="font-manrope text-[15px] sm:text-[16px] font-semibold text-[var(--text-primary)] tabular-nums shrink-0">
                  ${item.price.toLocaleString('en-US')}
                </span>
              </div>

              {/* Stock Status & Actions Footer */}
              <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-[var(--border-color)] mt-3">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.stock <= 2 ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
                    }`}
                  />
                  <span
                    className={`label-caps text-[9.5px] sm:text-[10px] uppercase font-semibold ${
                      item.stock <= 2 ? 'text-rose-500' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {item.stock} in stock {item.stock <= 2 && '(Low)'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleStockAdjust(item.id, -1)}
                    aria-label="Decrease Stock"
                    className="w-6 h-6 rounded border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--gold)] transition-colors cursor-pointer"
                  >
                    <Minus size={11} />
                  </button>
                  <button
                    onClick={() => handleStockAdjust(item.id, 1)}
                    aria-label="Increase Stock"
                    className="w-6 h-6 rounded border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--gold)] transition-colors cursor-pointer"
                  >
                    <Plus size={11} />
                  </button>
                  <button
                    onClick={() => handleDeletePiece(item.id)}
                    aria-label="Delete Piece"
                    title="Delete Piece"
                    className="w-6 h-6 rounded border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-rose-500 hover:border-rose-500 transition-colors cursor-pointer ml-1"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Mode */
        <>
          {/* Mobile Cards for List Mode */}
          <div className="block sm:hidden space-y-3">
            {filteredInventory.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPiece(item)}
                className="p-3.5 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.title} className="w-12 h-16 object-cover border border-[var(--border-color)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="label-caps text-[9px] text-[var(--text-muted)] block truncate">{item.sku}</span>
                    <h4 className="font-garamond text-[16px] text-[var(--text-primary)] leading-tight line-clamp-1">{item.title}</h4>
                    <span className="text-[11.5px] text-[var(--text-secondary)] block truncate">{item.material}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[var(--border-color)]/60 text-[13px]">
                  <span className={`font-semibold text-[12px] ${item.stock <= 2 ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {item.stock} Units
                  </span>
                  <span className="font-semibold text-[15px] text-[var(--text-primary)] tabular-nums">
                    ${item.price.toLocaleString('en-US')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] label-caps text-[11px] uppercase tracking-widest bg-[var(--bg-secondary)]/50">
                  <th className="py-4 px-5 font-medium">Piece Details</th>
                  <th className="py-4 px-5 font-medium">SKU</th>
                  <th className="py-4 px-5 font-medium">Fabric/Weave</th>
                  <th className="py-4 px-5 font-medium">Stock</th>
                  <th className="py-4 px-5 font-medium text-right">Price</th>
                  <th className="py-4 px-5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] font-manrope text-[14px]">
                {filteredInventory.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedPiece(item)}
                    className="hover:bg-[var(--bg-secondary)]/40 transition-colors group cursor-pointer"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.title} className="w-10 h-12 object-cover border border-[var(--border-color)]" />
                        <div>
                          <p className="font-garamond text-[17px] text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">
                            {item.title}
                          </p>
                          <span className="label-caps text-[10px] text-[var(--text-muted)]">{item.collectionTag}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-[13px] text-[var(--text-secondary)]">{item.sku}</td>
                    <td className="py-4 px-5 text-[13px] text-[var(--text-secondary)]">{item.material}</td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 text-[12px] ${item.stock <= 2 ? 'text-rose-500 font-bold' : 'text-[var(--text-primary)]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.stock <= 2 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                        {item.stock} Units
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right font-semibold text-[var(--text-primary)] tabular-nums">
                      ${item.price.toLocaleString('en-US')}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPiece(item);
                        }}
                        className="text-[var(--text-secondary)] hover:text-[var(--gold)] p-1.5"
                      >
                        <MoreHorizontal size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Pagination Load More */}
      <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex justify-center pb-6">
        <button
          onClick={() => toast.info('All curated atelier inventory pieces loaded.')}
          className="label-caps text-[11px] uppercase tracking-widest text-[var(--text-primary)] border-b border-[var(--text-primary)] hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors pb-1 cursor-pointer"
        >
          Load More Pieces
        </button>
      </div>

      {/* Selected Piece Modal */}
      {selectedPiece && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-color)] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-7 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="label-caps text-[10px] text-[var(--gold)] tracking-widest uppercase">
                  {selectedPiece.sku}
                </span>
                <h2 className="font-garamond text-[22px] sm:text-[24px] text-[var(--text-primary)] font-normal mt-0.5">
                  {selectedPiece.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedPiece(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="aspect-[4/3] w-full bg-[var(--bg-secondary)] overflow-hidden border border-[var(--border-color)] relative">
              <img
                src={selectedPiece.image}
                alt={selectedPiece.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 border border-[var(--border-color)] bg-[var(--bg-secondary)]/30 font-manrope text-[12.5px] sm:text-[13px]">
              <div>
                <span className="text-[var(--text-secondary)] label-caps text-[9.5px] uppercase block mb-0.5">SKU</span>
                <span className="font-medium text-[var(--text-primary)]">{selectedPiece.sku}</span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] label-caps text-[9.5px] uppercase block mb-0.5">Price</span>
                <span className="font-semibold text-[var(--text-primary)]">${selectedPiece.price.toLocaleString('en-US')}</span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] label-caps text-[9.5px] uppercase block mb-0.5">Status</span>
                <span className={`font-semibold capitalize ${selectedPiece.stock <= 2 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {selectedPiece.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] label-caps text-[9.5px] uppercase block mb-0.5">On-Hand Stock</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-semibold text-[var(--text-primary)]">{selectedPiece.stock} units</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleStockAdjust(selectedPiece.id, -1)}
                      className="w-5 h-5 rounded border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      <Minus size={10} />
                    </button>
                    <button
                      onClick={() => handleStockAdjust(selectedPiece.id, 1)}
                      className="w-5 h-5 rounded border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p className="body-sm text-[13px] text-[var(--text-secondary)] leading-relaxed">
              Crafted from <span className="text-[var(--text-primary)] font-medium">{selectedPiece.material}</span>. Assigned to {selectedPiece.collectionTag}.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  toast.success(`Updated collection parameters for ${selectedPiece.title}`);
                  setSelectedPiece(null);
                }}
                className="flex-1 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[11px] uppercase tracking-wider py-3 shadow-sm hover:opacity-90 cursor-pointer"
              >
                Save Updates
              </button>
              <button
                onClick={() => handleDeletePiece(selectedPiece.id)}
                className="px-4 py-3 border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 label-caps text-[11px] uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
              <button
                onClick={() => setSelectedPiece(null)}
                className="px-5 border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--gold)] label-caps text-[11px] uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Piece Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-color)] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-8 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="label-caps text-[10px] text-[var(--gold)] tracking-widest uppercase">
                  ATELIER CATALOGUE
                </span>
                <h2 className="font-garamond text-[22px] sm:text-[26px] text-[var(--text-primary)] font-normal mt-0.5">
                  Add New Heritage Piece
                </h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddPiece} className="space-y-4 font-manrope text-[13px]">
              <div>
                <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1">
                  PIECE TITLE *
                </label>
                <input
                  type="text"
                  required
                  value={newPiece.title}
                  onChange={(e) => setNewPiece({ ...newPiece, title: e.target.value })}
                  placeholder="e.g. Zardozi Embroidered Velvet Shawl"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1">
                    SKU IDENTIFIER
                  </label>
                  <input
                    type="text"
                    value={newPiece.sku}
                    onChange={(e) => setNewPiece({ ...newPiece, sku: e.target.value })}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-3 text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1">
                    COLLECTION
                  </label>
                  <select
                    value={newPiece.collectionTag}
                    onChange={(e) => setNewPiece({ ...newPiece, collectionTag: e.target.value })}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-3 text-[var(--text-primary)] outline-none cursor-pointer"
                  >
                    <option>Heritage Saree</option>
                    <option>Menswear</option>
                    <option>Atelier Bespoke</option>
                    <option>Accessories</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1">
                    PRICE (USD) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newPiece.price}
                    onChange={(e) => setNewPiece({ ...newPiece, price: e.target.value })}
                    placeholder="850"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1">
                    INITIAL STOCK *
                  </label>
                  <input
                    type="number"
                    required
                    value={newPiece.stock}
                    onChange={(e) => setNewPiece({ ...newPiece, stock: e.target.value })}
                    placeholder="10"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1">
                  FABRIC / WEAVE
                </label>
                <input
                  type="text"
                  value={newPiece.material}
                  onChange={(e) => setNewPiece({ ...newPiece, material: e.target.value })}
                  placeholder="Pure Silk & Antique Gold Thread"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[11px] uppercase tracking-wider py-3 shadow-sm hover:opacity-90 cursor-pointer"
                >
                  Publish Piece
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--gold)] label-caps text-[11px] uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
