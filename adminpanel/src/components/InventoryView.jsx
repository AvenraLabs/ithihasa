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
  Trash2,
  Image as ImageIcon,
  FolderPlus,
  Tag
} from 'lucide-react';
import { fetchInventory, adjustInventoryStock, createProduct, deleteProduct } from '../api/inventory.js';
import { fetchCategories, createCategory, deleteCategory } from '../api/categories.js';
import { toast } from 'sonner';

const HERITAGE_IMAGE_PRESETS = [
  {
    name: 'Kanchipuram Silk',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Velvet Bandhgala',
    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Banarasi Sherwani',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Pashmina Stole',
    url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Varanasi Raw Silk',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Zari Brocade',
    url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80'
  }
];

const formatINR = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

export function InventoryView() {
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([
    { id: 'c1', name: 'Heritage Saree', slug: 'heritage-saree', description: 'Handcrafted heirlooms and mulberry silks' },
    { id: 'c2', name: 'Bandhgalas & Jackets', slug: 'bandhgalas-jackets', description: 'Structured royal velvet silhouettes' },
    { id: 'c3', name: 'Atelier Bespoke', slug: 'atelier-bespoke', description: 'Custom artisan creations and bridal wear' },
    { id: 'c4', name: 'Royal Shawls & Stoles', slug: 'royal-shawls-stoles', description: 'Pashmina and Banarasi zari wraps' }
  ]);

  const [viewMode, setViewMode] = useState('grid');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Category Master Form State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // Load Inventory from Backend
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [inventoryData, categoriesData] = await Promise.all([
          fetchInventory({ search: searchQuery || undefined }).catch(() => null),
          fetchCategories().catch(() => null)
        ]);

        if (categoriesData && Array.isArray(categoriesData) && categoriesData.length > 0) {
          setCategories(categoriesData);
        }

        if (inventoryData && Array.isArray(inventoryData)) {
          const formatted = inventoryData.map((p) => {
            const variant = p.variants?.[0] || {};
            const stockVal = variant.inventory?.on_hand ?? 8;
            return {
              id: p.id,
              variantId: variant.id,
              sku: p.sku || variant.sku || `SKU-IH-${p.id.slice(0, 4)}`,
              title: p.name,
              material: p.fabric_composition || 'Pure Mulberry Silk',
              price: Number(p.base_price || 24500),
              stock: stockVal,
              status: stockVal <= 2 ? 'low_stock' : 'in_stock',
              collectionTag: p.category?.name || 'Heritage Saree',
              image: p.images?.[0]?.url || HERITAGE_IMAGE_PRESETS[0].url
            };
          });
          setInventory(formatted);
        } else {
          setInventory([]);
        }
      } catch (err) {
        console.error('Inventory live sync error:', err);
        toast.error('Unable to fetch live inventory. Please check connection.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
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
            status: newStock <= 2 ? 'low_stock' : 'in_stock'
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
          reason: 'MANUAL_ATELIER_STOCK_ADJUST'
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

  // Add Category Handler (Collection Master)
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const slug = newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      slug,
      description: newCategoryDesc.trim() || 'Atelier curated luxury collection'
    };

    setCategories((prev) => [...prev, newCat]);
    setNewCategoryName('');
    setNewCategoryDesc('');
    toast.success(`Collection "${newCat.name}" added to master.`);

    try {
      await createCategory({
        name: newCat.name,
        slug: newCat.slug,
        description: newCat.description
      }).catch(() => null);
    } catch (err) {
      console.warn('Category create sync note:', err.message);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    toast.success(`Removed collection "${catName}"`);

    try {
      await deleteCategory(catId).catch(() => null);
    } catch (err) {
      console.warn('Category delete sync note:', err.message);
    }
  };

  // New Piece Form State
  const [newPiece, setNewPiece] = useState({
    title: '',
    sku: `SKU-IH-${Math.floor(1000 + Math.random() * 9000)}`,
    material: '',
    price: '',
    stock: '',
    color: 'Midnight Noir',
    sizes: ['38', '40', '42', 'Free Size'],
    collectionTag: 'Heritage Saree',
    image: HERITAGE_IMAGE_PRESETS[0].url
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

  const handleAddPiece = async (e) => {
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
      image: newPiece.image || HERITAGE_IMAGE_PRESETS[0].url
    };

    setInventory([piece, ...inventory]);
    setIsAddModalOpen(false);
    toast.success(`Published ${piece.title} to atelier catalogue`);

    try {
      const selectedCat = categories.find((c) => c.name === newPiece.collectionTag);
      const selectedSizes = newPiece.sizes?.length > 0 ? newPiece.sizes : ['Free Size'];
      const variantsPayload = selectedSizes.map((sz, idx) => ({
        sku: `${piece.sku}-${sz.replace(/\s+/g, '')}`,
        size: sz,
        color: newPiece.color || 'Midnight Noir',
        price: piece.price,
        initialStock: Math.max(1, Math.floor(piece.stock / selectedSizes.length))
      }));

      await createProduct({
        name: piece.title,
        slug: piece.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: piece.material,
        basePrice: piece.price,
        categorySlug: selectedCat?.slug || 'heritage-saree',
        images: [{ url: piece.image, altText: piece.title, isPrimary: true }],
        variants: variantsPayload
      }).catch(() => null);
    } catch (err) {
      console.warn('Create product sync note:', err.message);
    }

    setNewPiece({
      title: '',
      sku: `SKU-IH-${Math.floor(1000 + Math.random() * 9000)}`,
      material: '',
      price: '',
      stock: '',
      color: 'Midnight Noir',
      sizes: ['38', '40', '42', 'Free Size'],
      collectionTag: 'Heritage Saree',
      image: HERITAGE_IMAGE_PRESETS[0].url
    });
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-[1440px] w-full mx-auto space-y-6 md:space-y-8 flex-1 min-w-0">
      {/* Header & Page Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 border-b border-[var(--border-color)] pb-4">
        <div>
          <span className="label-caps text-[10px] sm:text-[11px] text-[var(--gold)] tracking-widest uppercase">
            ATELIER CATALOGUE & STOCK
          </span>
          <h1 className="font-garamond text-[28px] sm:text-[34px] md:text-[44px] text-[var(--text-primary)] font-normal tracking-tight leading-tight m-0">
            Inventory
          </h1>
          <p className="body-md text-[13px] sm:text-[14px] md:text-[15px] text-[var(--text-secondary)] mt-1">
            Curate royal silhouettes, track on-hand pieces, and manage collection master.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          {/* Collection Master Action Button */}
          <button
            onClick={() => setIsCollectionModalOpen(true)}
            className="flex-1 sm:flex-none border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-primary)] px-4 py-2.5 sm:py-3 transition-colors flex items-center justify-center gap-2 label-caps text-[11px] uppercase tracking-wider font-semibold cursor-pointer shadow-sm"
          >
            <Tag size={14} className="text-[var(--gold)]" />
            <span>Collection Master ({categories.length})</span>
          </button>

          {/* Add Piece Action Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-none bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:opacity-90 px-4 sm:px-5 py-2.5 sm:py-3 transition-all flex items-center justify-center gap-2 label-caps text-[11px] uppercase tracking-wider font-semibold cursor-pointer shadow-sm"
          >
            <Plus size={14} />
            <span>Add New Piece</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Status Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="md:col-span-2 relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by piece title, SKU, or fabric weave..."
            className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[var(--gold)] text-[var(--text-primary)] font-manrope text-[13.5px] pl-10 pr-4 py-2.5 outline-none transition-colors"
          />
        </div>

        <div className="flex items-center justify-end gap-2 text-[12px] font-manrope text-[var(--text-secondary)]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{inStockCount} In Stock</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>{lowStockCount} Low Threshold</span>
          </span>
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
              viewMode === 'grid'
                ? 'bg-[var(--gold)] text-black font-semibold'
                : 'hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            aria-label="List View"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[var(--gold)] text-black font-semibold'
                : 'hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Main Inventory Display (Grid or List) */}
      {filteredInventory.length === 0 ? (
        <div className="p-12 text-center bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
          <Package size={32} className="mx-auto text-[var(--text-secondary)] opacity-50" />
          <p className="font-garamond text-[20px] text-[var(--text-primary)]">No atelier pieces found</p>
          <p className="body-sm text-[13px] text-[var(--text-secondary)]">Try clearing your search query or filters.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Mode: Responsive 1 col (mobile), 2 cols (tablet), 3-4 cols (desktop) */
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

                {/* Collection Tag */}
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
                  {formatINR(item.price)}
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
          {/* Mobile Cards for List Mode (<640px) */}
          <div className="block sm:hidden space-y-3">
            {filteredInventory.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPiece(item)}
                className="p-3.5 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-12 h-16 object-cover border border-[var(--border-color)] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start">
                      <span className="label-caps text-[9px] text-[var(--text-secondary)] uppercase">{item.sku}</span>
                      <span className="font-manrope font-semibold text-[14px] text-[var(--text-primary)] tabular-nums">
                        {formatINR(item.price)}
                      </span>
                    </div>
                    <h3 className="font-garamond text-[16px] text-[var(--text-primary)] truncate">{item.title}</h3>
                    <p className="body-sm text-[11px] text-[var(--text-secondary)] truncate">{item.material}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]" onClick={(e) => e.stopPropagation()}>
                  <span className={`font-semibold text-[12px] ${item.stock <= 2 ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {item.stock} Units on hand
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStockAdjust(item.id, -1)}
                      className="w-7 h-7 rounded border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)]"
                    >
                      <Minus size={12} />
                    </button>
                    <button
                      onClick={() => handleStockAdjust(item.id, 1)}
                      className="w-7 h-7 rounded border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)]"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => handleDeletePiece(item.id)}
                      className="w-7 h-7 rounded border border-rose-500/30 text-rose-500 flex items-center justify-center ml-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>=640px) */}
          <div className="hidden sm:block overflow-x-auto border border-[var(--border-color)] bg-[var(--bg-card)]">
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
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-10 h-12 object-cover border border-[var(--border-color)]"
                        />
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
                      <span
                        className={`inline-flex items-center gap-1.5 text-[12px] ${
                          item.stock <= 2 ? 'text-rose-500 font-bold' : 'text-[var(--text-primary)]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.stock <= 2 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                        {item.stock} Units
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right font-semibold text-[var(--text-primary)] tabular-nums">
                      {formatINR(item.price)}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedPiece(item)}
                          className="text-[var(--text-secondary)] hover:text-[var(--gold)] p-1.5 cursor-pointer"
                          aria-label="Inspect piece"
                        >
                          <MoreHorizontal size={17} />
                        </button>
                        <button
                          onClick={() => handleDeletePiece(item.id)}
                          className="text-[var(--text-secondary)] hover:text-rose-500 p-1.5 cursor-pointer"
                          aria-label="Delete piece"
                          title="Delete piece"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Selected Piece Specifications Modal */}
      {selectedPiece && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-color)] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-7 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="label-caps text-[10px] text-[var(--gold)] tracking-widest uppercase">
                  PIECE SPECIFICATIONS
                </span>
                <h2 className="font-garamond text-[20px] sm:text-[24px] text-[var(--text-primary)] font-normal mt-0.5">
                  {selectedPiece.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedPiece(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="aspect-[4/3] w-full bg-[var(--bg-secondary)] overflow-hidden border border-[var(--border-color)] relative">
              <img src={selectedPiece.image} alt={selectedPiece.title} className="w-full h-full object-cover" />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 border border-[var(--border-color)] bg-[var(--bg-secondary)]/30 font-manrope text-[12.5px] sm:text-[13px]">
              <div>
                <span className="text-[var(--text-secondary)] label-caps text-[9.5px] uppercase block mb-0.5">SKU</span>
                <span className="font-medium text-[var(--text-primary)]">{selectedPiece.sku}</span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] label-caps text-[9.5px] uppercase block mb-0.5">Price</span>
                <span className="font-semibold text-[var(--text-primary)]">{formatINR(selectedPiece.price)}</span>
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
                  toast.success(`Updated parameters for ${selectedPiece.title}`);
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

      {/* Collection Master Modal */}
      {isCollectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-color)] max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-7 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="label-caps text-[10px] text-[var(--gold)] tracking-widest uppercase">
                  CURATION TAXONOMY
                </span>
                <h2 className="font-garamond text-[22px] sm:text-[26px] text-[var(--text-primary)] font-normal mt-0.5">
                  Collection Master
                </h2>
              </div>
              <button
                onClick={() => setIsCollectionModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Existing Collections List */}
            <div className="space-y-2">
              <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-2">
                ACTIVE ATELIER COLLECTIONS ({categories.length})
              </label>
              <div className="divide-y divide-[var(--border-color)] border border-[var(--border-color)] bg-[var(--bg-secondary)]/20 max-h-56 overflow-y-auto">
                {categories.map((cat) => (
                  <div key={cat.id || cat.slug} className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[13.5px] text-[var(--text-primary)]">{cat.name}</span>
                        <span className="label-caps text-[9px] text-[var(--gold)] bg-[var(--gold)]/10 px-1.5 py-0.5 rounded">
                          /{cat.slug}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-[var(--text-secondary)] truncate mt-0.5">{cat.description}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="text-[var(--text-secondary)] hover:text-rose-500 p-1 cursor-pointer"
                      title="Remove Collection"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Collection Form */}
            <form onSubmit={handleAddCategory} className="border-t border-[var(--border-color)] pt-4 space-y-3.5">
              <span className="label-caps text-[10px] uppercase text-[var(--gold)] font-bold block">
                CREATE NEW COLLECTION
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block label-caps text-[9.5px] uppercase text-[var(--text-secondary)] mb-1">
                    Collection Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Royal Brocade & Zari"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-2.5 text-[13px] text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="block label-caps text-[9.5px] uppercase text-[var(--text-secondary)] mb-1">
                    Description / Editorial Note
                  </label>
                  <input
                    type="text"
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                    placeholder="Handwoven metallic silks"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-2.5 text-[13px] text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-1">
                <button
                  type="submit"
                  className="bg-[var(--gold)] text-black font-semibold label-caps text-[11px] uppercase tracking-wider px-4 py-2.5 hover:opacity-90 cursor-pointer flex items-center gap-1.5"
                >
                  <FolderPlus size={14} />
                  <span>Save Collection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Piece Modal with Image Picker & Collection Master */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-color)] max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-8 space-y-5"
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
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddPiece} className="space-y-4 font-manrope text-[13px]">
              {/* Piece Title */}
              <div>
                <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1">
                  PIECE TITLE *
                </label>
                <input
                  type="text"
                  required
                  value={newPiece.title}
                  onChange={(e) => setNewPiece({ ...newPiece, title: e.target.value })}
                  placeholder="e.g. Varanasi Handloom Silk Kurta"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none"
                />
              </div>

              {/* SKU & Collection Selector */}
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
                  <div className="flex justify-between items-center mb-1">
                    <label className="label-caps text-[10px] uppercase text-[var(--text-secondary)]">
                      COLLECTION *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCollectionModalOpen(true)}
                      className="text-[10px] text-[var(--gold)] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus size={10} />
                      <span>Manage</span>
                    </button>
                  </div>
                  <select
                    value={newPiece.collectionTag}
                    onChange={(e) => setNewPiece({ ...newPiece, collectionTag: e.target.value })}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-3 text-[var(--text-primary)] outline-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id || cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price (INR ₹) & Initial Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1">
                    PRICE (INR ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPiece.price}
                    onChange={(e) => setNewPiece({ ...newPiece, price: e.target.value })}
                    placeholder="24500"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1">
                    INITIAL ON-HAND STOCK *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newPiece.stock}
                    onChange={(e) => setNewPiece({ ...newPiece, stock: e.target.value })}
                    placeholder="10"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>

              {/* Sizes Multi-Selection & Color Variant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1 font-semibold">
                    AVAILABLE SIZES
                  </label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['38', '40', '42', '44', 'Free Size'].map((sz) => {
                      const isSelected = newPiece.sizes?.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            const current = newPiece.sizes || [];
                            const next = isSelected
                              ? current.filter((s) => s !== sz)
                              : [...current, sz];
                            setNewPiece({ ...newPiece, sizes: next.length > 0 ? next : [sz] });
                          }}
                          className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider border rounded transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--gold)] text-black border-[var(--gold)]'
                              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--gold)]'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1 font-semibold">
                    COLOR VARIANT NAME
                  </label>
                  <input
                    type="text"
                    value={newPiece.color || ''}
                    onChange={(e) => setNewPiece({ ...newPiece, color: e.target.value })}
                    placeholder="e.g. Midnight Noir, Warm Black"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-2.5 text-[13px] text-[var(--text-primary)] outline-none rounded"
                  />
                </div>
              </div>

              {/* Image Picker & URL Input with Live Preview */}
              <div className="border border-[var(--border-color)] p-3.5 bg-[var(--bg-secondary)]/30 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="label-caps text-[10px] uppercase text-[var(--text-secondary)] flex items-center gap-1.5 font-bold">
                    <ImageIcon size={13} className="text-[var(--gold)]" />
                    <span>HERITAGE PHOTOGRAPHY *</span>
                  </label>
                </div>

                <div className="flex gap-3 items-center">
                  {/* Live Thumbnail Preview */}
                  <div className="w-16 h-20 bg-[var(--bg-card)] border border-[var(--border-color)] shrink-0 overflow-hidden relative">
                    {newPiece.image ? (
                      <img src={newPiece.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)] text-[10px]">
                        No Img
                      </div>
                    )}
                  </div>

                  {/* Direct Image URL input */}
                  <div className="flex-1 space-y-1">
                    <input
                      type="url"
                      required
                      value={newPiece.image}
                      onChange={(e) => setNewPiece({ ...newPiece, image: e.target.value })}
                      placeholder="https://... image URL"
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[var(--gold)] p-2 text-[12px] text-[var(--text-primary)] outline-none"
                    />
                    <span className="text-[11px] text-[var(--text-secondary)] block">
                      Select a preset below or paste an image URL.
                    </span>
                  </div>
                </div>

                {/* Preset Garment Photo Gallery */}
                <div>
                  <span className="label-caps text-[9px] uppercase text-[var(--text-secondary)] block mb-1.5">
                    QUICK PRESETS:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {HERITAGE_IMAGE_PRESETS.map((preset) => (
                      <button
                        type="button"
                        key={preset.name}
                        onClick={() => setNewPiece({ ...newPiece, image: preset.url })}
                        className={`group relative aspect-[3/4] border overflow-hidden cursor-pointer transition-all ${
                          newPiece.image === preset.url
                            ? 'border-[var(--gold)] ring-2 ring-[var(--gold)]/30'
                            : 'border-[var(--border-color)] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] text-white p-0.5 text-center truncate">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
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
