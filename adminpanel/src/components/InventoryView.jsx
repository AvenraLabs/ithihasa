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
  ArrowLeft,
  Edit,
  Check,
  Trash2,
  Image as ImageIcon,
  FolderPlus,
  Tag,
  Info,
  Palette,
  Ruler,
  Upload,
  Loader2
} from 'lucide-react';
import { fetchInventory, adjustInventoryStock, createProduct, deleteProduct } from '../api/inventory.js';
import { fetchCategories, createCategory, deleteCategory } from '../api/categories.js';
import { uploadImage } from '../api/upload.js';
import { ImageUploader } from './ImageUploader.jsx';
import { toast } from 'sonner';

const formatINR = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

const DEFAULT_SIZES = ['36', '38', '40', '42', '44', '46', '48', 'Free Size', 'S', 'M', 'L', 'XL', 'XXL'];

const DEFAULT_COLORS = [
  { name: 'Midnight Noir', hex: '#0A0A0A' },
  { name: 'Royal Crimson', hex: '#7A1C22' },
  { name: 'Antique Gold', hex: '#C9A24B' },
  { name: 'Ivory Silk', hex: '#F4EFE6' },
  { name: 'Emerald Heritage', hex: '#1B4D3E' },
  { name: 'Deep Sapphire', hex: '#1A2A44' },
  { name: 'Burnt Ochre', hex: '#A35D2A' }
];

export function InventoryView() {
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);

  // Masters
  const [masterSizes, setMasterSizes] = useState(() => {
    try {
      const saved = localStorage.getItem('ithihasa_master_sizes');
      return saved ? JSON.parse(saved) : DEFAULT_SIZES;
    } catch {
      return DEFAULT_SIZES;
    }
  });

  const [masterColors, setMasterColors] = useState(() => {
    try {
      const saved = localStorage.getItem('ithihasa_master_colors');
      return saved ? JSON.parse(saved) : DEFAULT_COLORS;
    } catch {
      return DEFAULT_COLORS;
    }
  });

  // Sub-views: 'list' | 'new_piece' | 'collections' | 'color_size_master' | 'piece_details'
  const [subView, setSubView] = useState('list');
  const [selectedPiece, setSelectedPiece] = useState(null);

  const [viewMode, setViewMode] = useState('grid');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // New Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // Master Forms State
  const [newSizeInput, setNewSizeInput] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#C9A24B');

  // New Piece Form State
  const [newPiece, setNewPiece] = useState({
    title: '',
    sku: `SKU-IH-${Math.floor(1000 + Math.random() * 9000)}`,
    material: '',
    price: '',
    stock: '',
    collectionTag: '',
    sizes: ['38', '40', '42', 'Free Size'],
    // Colors with array of 0 to 3 images
    colors: [
      { name: 'Midnight Noir', hex: '#0A0A0A', images: [] }
    ]
  });

  const [isCollectionDropdownOpen, setIsCollectionDropdownOpen] = useState(false);
  const [uploadingColorIdx, setUploadingColorIdx] = useState(null);

  // Save Masters to localStorage
  const saveMasterSizes = (sizes) => {
    setMasterSizes(sizes);
    try {
      localStorage.setItem('ithihasa_master_sizes', JSON.stringify(sizes));
    } catch {}
  };

  const saveMasterColors = (colors) => {
    setMasterColors(colors);
    try {
      localStorage.setItem('ithihasa_master_colors', JSON.stringify(colors));
    } catch {}
  };

  // Load live data
  const loadData = async () => {
    try {
      setLoading(true);
      const [inventoryData, categoriesData] = await Promise.all([
        fetchInventory({ search: searchQuery || undefined }).catch(() => null),
        fetchCategories().catch(() => null)
      ]);

      if (categoriesData && Array.isArray(categoriesData)) {
        setCategories(categoriesData);
        if (categoriesData.length > 0 && !newPiece.collectionTag) {
          setNewPiece((prev) => ({ ...prev, collectionTag: categoriesData[0].name }));
        }
      } else {
        setCategories([]);
      }

      if (inventoryData && Array.isArray(inventoryData)) {
        const formatted = inventoryData.map((p) => {
          const variant = p.variants?.[0] || {};
          const stockVal = variant.inventory?.on_hand ?? 0;
          return {
            id: p.id,
            variantId: variant.id,
            sku: p.sku || variant.sku || `SKU-IH-${p.id.slice(0, 4)}`,
            title: p.name,
            material: p.fabric_composition || p.description || 'Heritage Textile',
            price: Number(p.base_price || 0),
            stock: stockVal,
            status: stockVal <= 2 ? 'low_stock' : 'in_stock',
            collectionTag: p.category?.name || 'Unassigned',
            image: p.images?.[0]?.url || '',
            metadata: p.metadata
          };
        });
        setInventory(formatted);
      } else {
        setInventory([]);
      }
    } catch (err) {
      console.error('Inventory sync error:', err);
      toast.error('Unable to fetch live inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  const handleStockAdjust = async (pieceId, delta) => {
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

    if (selectedPiece && selectedPiece.id === pieceId) {
      const newStock = Math.max(0, selectedPiece.stock + delta);
      setSelectedPiece({
        ...selectedPiece,
        stock: newStock,
        status: newStock <= 2 ? 'low_stock' : 'in_stock'
      });
    }

    const piece = inventory.find((p) => p.id === pieceId);
    if (piece?.variantId) {
      try {
        await adjustInventoryStock({
          variantId: piece.variantId,
          delta,
          reason: 'MANUAL_ATELIER_STOCK_ADJUST'
        });
      } catch (err) {
        console.warn('Backend stock adjust note:', err.message);
      }
    }
  };

  const handleDeletePiece = async (pieceId) => {
    const pieceToDelete = inventory.find((p) => p.id === pieceId);
    try {
      await deleteProduct(pieceId);
      setInventory((prev) => prev.filter((item) => item.id !== pieceId));
      if (selectedPiece && selectedPiece.id === pieceId) {
        setSelectedPiece(null);
        setSubView('list');
      }
      toast.success(`Removed ${pieceToDelete?.title || 'piece'} from inventory`);
    } catch (err) {
      console.error('Delete product error:', err);
      toast.error(err.message || 'Failed to remove piece');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const slug = newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const payload = {
      name: newCategoryName.trim(),
      slug,
      description: newCategoryDesc.trim() || 'Atelier curated luxury collection'
    };

    try {
      const created = await createCategory(payload);
      setCategories((prev) => [...prev, created || payload]);
      setNewCategoryName('');
      setNewCategoryDesc('');
      toast.success(`Collection "${payload.name}" added to master.`);
      loadData();
    } catch (err) {
      console.error('Category create error:', err);
      toast.error(err.message || 'Failed to save collection');
    }
  };

  const handleDeleteCategory = async (catIdOrSlug, catName) => {
    try {
      await deleteCategory(catIdOrSlug);
      setCategories((prev) => prev.filter((c) => c.id !== catIdOrSlug && c.slug !== catIdOrSlug));
      toast.success(`Removed collection "${catName}"`);
      loadData();
    } catch (err) {
      console.error('Category delete error:', err);
      toast.error(err.message || 'Failed to remove collection');
    }
  };

  // Color & Size Master Handlers
  const handleAddSizeMaster = (e) => {
    e.preventDefault();
    const clean = newSizeInput.trim().toUpperCase();
    if (!clean) return;
    if (masterSizes.includes(clean)) {
      toast.error('Size already exists in master');
      return;
    }
    const updated = [...masterSizes, clean];
    saveMasterSizes(updated);
    setNewSizeInput('');
    toast.success(`Size "${clean}" added to master.`);
  };

  const handleDeleteSizeMaster = (sz) => {
    const updated = masterSizes.filter((s) => s !== sz);
    saveMasterSizes(updated);
    toast.success(`Removed size "${sz}" from master`);
  };

  const handleAddColorMaster = (e) => {
    e.preventDefault();
    const name = newColorName.trim();
    if (!name) return;
    if (masterColors.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Color name already exists');
      return;
    }
    const updated = [...masterColors, { name, hex: newColorHex }];
    saveMasterColors(updated);
    setNewColorName('');
    setNewColorHex('#C9A24B');
    toast.success(`Color "${name}" added to master.`);
  };

  const handleDeleteColorMaster = (colorName) => {
    const updated = masterColors.filter((c) => c.name !== colorName);
    saveMasterColors(updated);
    toast.success(`Removed color "${colorName}" from master`);
  };

  // Per-Color Image Upload Handler (0 to 3 images)
  const handleColorImageUpload = async (colorIdx, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WebP, AVIF).');
      return;
    }

    const targetColor = newPiece.colors[colorIdx];
    if (targetColor.images.length >= 3) {
      toast.error(`Maximum 3 images allowed for color "${targetColor.name}"`);
      return;
    }

    try {
      setUploadingColorIdx(colorIdx);
      const res = await uploadImage(file, 'products');
      if (res && res.url) {
        const updatedColors = [...newPiece.colors];
        updatedColors[colorIdx] = {
          ...targetColor,
          images: [...targetColor.images, res.url]
        };
        setNewPiece({ ...newPiece, colors: updatedColors });
        toast.success(`Photo added to "${targetColor.name}" (${updatedColors[colorIdx].images.length}/3)`);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      toast.error(err.message || 'Image upload failed');
    } finally {
      setUploadingColorIdx(null);
    }
  };

  const handleRemoveColorImage = (colorIdx, imgIdx) => {
    const updatedColors = [...newPiece.colors];
    const targetColor = updatedColors[colorIdx];
    updatedColors[colorIdx] = {
      ...targetColor,
      images: targetColor.images.filter((_, i) => i !== imgIdx)
    };
    setNewPiece({ ...newPiece, colors: updatedColors });
  };

  // Toggle Color Selection on Piece Form
  const handleToggleColor = (colorObj) => {
    const exists = newPiece.colors.some((c) => c.name === colorObj.name);
    if (exists) {
      if (newPiece.colors.length === 1) {
        toast.error('At least one color must be selected for the piece.');
        return;
      }
      setNewPiece({
        ...newPiece,
        colors: newPiece.colors.filter((c) => c.name !== colorObj.name)
      });
    } else {
      setNewPiece({
        ...newPiece,
        colors: [...newPiece.colors, { name: colorObj.name, hex: colorObj.hex, images: [] }]
      });
    }
  };

  const handleAddPiece = async (e) => {
    e.preventDefault();
    if (!newPiece.title || !newPiece.price || !newPiece.stock) {
      toast.error('Please enter title, price, and initial stock');
      return;
    }
    if (newPiece.colors.length === 0) {
      toast.error('Please select at least one color for the piece');
      return;
    }
    if (newPiece.sizes.length === 0) {
      toast.error('Please select at least one size for the piece');
      return;
    }

    try {
      const selectedCat = categories.find((c) => c.name === newPiece.collectionTag) || categories[0];
      const priceVal = parseFloat(newPiece.price);
      const stockVal = parseInt(newPiece.stock, 10);

      // Generate all (Color x Size) variants
      const variantsPayload = [];
      const totalCombinations = newPiece.colors.length * newPiece.sizes.length;
      const stockPerVariant = Math.max(1, Math.floor(stockVal / totalCombinations));

      newPiece.colors.forEach((color) => {
        newPiece.sizes.forEach((sz) => {
          variantsPayload.push({
            sku: `${newPiece.sku}-${color.name.slice(0, 3).toUpperCase()}-${sz.replace(/\s+/g, '')}`,
            size: sz,
            color: color.name,
            price: priceVal,
            initialStock: stockPerVariant
          });
        });
      });

      // Collect all images across colors
      const imagesPayload = [];
      newPiece.colors.forEach((color) => {
        color.images.forEach((imgUrl) => {
          imagesPayload.push({
            url: imgUrl,
            altText: color.name,
            sortOrder: imagesPayload.length,
            isPrimary: imagesPayload.length === 0
          });
        });
      });

      // Build metadata with colorSwatches so frontend can immediately render rounds + images
      const metadataPayload = {
        colorSwatches: newPiece.colors.map((c) => ({
          name: c.name,
          hex: c.hex,
          images: c.images
        }))
      };

      await createProduct({
        name: newPiece.title.trim(),
        slug: newPiece.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: newPiece.material || 'Handcrafted Heritage Masterpiece',
        basePrice: priceVal,
        categorySlug: selectedCat?.slug || 'heritage-saree',
        images: imagesPayload,
        variants: variantsPayload,
        metadata: metadataPayload
      });

      toast.success(`Published "${newPiece.title}" with ${newPiece.colors.length} color swatches to atelier catalogue!`);
      setSubView('list');
      setNewPiece({
        title: '',
        sku: `SKU-IH-${Math.floor(1000 + Math.random() * 9000)}`,
        material: '',
        price: '',
        stock: '',
        collectionTag: categories[0]?.name || '',
        sizes: ['38', '40', '42', 'Free Size'],
        colors: [{ name: 'Midnight Noir', hex: '#0A0A0A', images: [] }]
      });
      loadData();
    } catch (err) {
      console.error('Create product error:', err);
      toast.error(err.message || 'Failed to create piece in database');
    }
  };

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

  // ==========================================
  // VIEW: DEDICATED COLOR & SIZE MASTER PAGE
  // ==========================================
  if (subView === 'color_size_master') {
    return (
      <div className="p-4 sm:p-6 md:p-10 max-w-[1440px] w-full mx-auto space-y-8 flex-1 min-w-0 font-manrope">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSubView('list')}
              className="p-2 border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title="Back to Inventory"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <span className="label-caps text-[10px] sm:text-[11px] text-[var(--gold)] tracking-widest uppercase">
                ATELIER CONFIGURATION
              </span>
              <h1 className="font-garamond text-[26px] sm:text-[34px] text-[var(--text-primary)] font-normal tracking-tight">
                Color & Size Master
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* COLOR MASTER SECTION */}
          <section className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--gold)]">
                <Palette size={20} />
              </div>
              <div>
                <h2 className="text-[20px] font-normal text-[var(--text-primary)] font-garamond">
                  Color Master ({masterColors.length})
                </h2>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  Luxury palette definitions and hex rounds used across the storefront.
                </p>
              </div>
            </div>

            {/* Active Colors List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {masterColors.map((color) => (
                <div
                  key={color.name}
                  className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-6 h-6 rounded-full border border-white/20 shadow-sm shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div>
                      <span className="text-[13px] font-semibold text-[var(--text-primary)] block">
                        {color.name}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--text-secondary)] uppercase">
                        {color.hex}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteColorMaster(color.name)}
                    className="text-[var(--text-secondary)] hover:text-rose-500 p-1.5 cursor-pointer"
                    title="Remove Color"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Color Form */}
            <form onSubmit={handleAddColorMaster} className="border-t border-[var(--border-color)] pt-4 space-y-3">
              <span className="label-caps text-[10px] uppercase text-[var(--gold)] font-bold block">
                ADD NEW COLOR TO MASTER
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase text-[var(--text-secondary)] font-semibold block mb-1">
                    Color Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="e.g. Royal Indigo"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none rounded"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase text-[var(--text-secondary)] font-semibold block mb-1">
                    Hex Swatch
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-9 h-9 p-0.5 bg-transparent border border-[var(--border-color)] rounded cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-2 py-2 text-[12px] font-mono uppercase text-[var(--text-primary)] outline-none rounded"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--gold)] text-black font-semibold label-caps text-[11px] uppercase tracking-wider py-2.5 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5 rounded"
              >
                <Plus size={14} />
                <span>Save Color to Master</span>
              </button>
            </form>
          </section>

          {/* SIZE MASTER SECTION */}
          <section className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--gold)]">
                <Ruler size={20} />
              </div>
              <div>
                <h2 className="text-[20px] font-normal text-[var(--text-primary)] font-garamond">
                  Size Master ({masterSizes.length})
                </h2>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  Standardized size labels available when minting heritage silhouettes.
                </p>
              </div>
            </div>

            {/* Active Sizes Chips */}
            <div className="flex flex-wrap gap-2.5 max-h-72 overflow-y-auto pr-1">
              {masterSizes.map((sz) => (
                <div
                  key={sz}
                  className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded text-[13px] font-semibold text-[var(--text-primary)]"
                >
                  <span>{sz}</span>
                  <button
                    onClick={() => handleDeleteSizeMaster(sz)}
                    className="text-[var(--text-secondary)] hover:text-rose-500 cursor-pointer p-0.5"
                    title="Remove Size"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Size Form */}
            <form onSubmit={handleAddSizeMaster} className="border-t border-[var(--border-color)] pt-4 space-y-3">
              <span className="label-caps text-[10px] uppercase text-[var(--gold)] font-bold block">
                ADD NEW SIZE TO MASTER
              </span>
              <div className="flex gap-3">
                <input
                  type="text"
                  required
                  value={newSizeInput}
                  onChange={(e) => setNewSizeInput(e.target.value)}
                  placeholder="e.g. 50, 3XL, Bespoke"
                  className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none rounded"
                />
                <button
                  type="submit"
                  className="bg-[var(--gold)] text-black font-semibold label-caps text-[11px] uppercase tracking-wider px-5 py-2.5 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer flex items-center gap-1.5 rounded"
                >
                  <Plus size={14} />
                  <span>Add Size</span>
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: DEDICATED ADD NEW PIECE PAGE
  // ==========================================
  if (subView === 'new_piece') {
    return (
      <div className="p-4 sm:p-6 md:p-10 max-w-[1440px] w-full mx-auto space-y-8 flex-1 min-w-0 font-manrope">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSubView('list')}
              className="p-2 border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title="Back to Inventory"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <span className="label-caps text-[10px] sm:text-[11px] text-[var(--gold)] tracking-widest uppercase">
                ATELIER CATALOGUE
              </span>
              <h1 className="font-garamond text-[26px] sm:text-[34px] text-[var(--text-primary)] font-normal tracking-tight">
                Add New Heritage Piece
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSubView('color_size_master')}
            className="border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-primary)] px-4 py-2 text-[11px] label-caps uppercase tracking-wider flex items-center gap-1.5 rounded cursor-pointer"
          >
            <Palette size={14} className="text-[var(--gold)]" />
            <span>Color & Size Master</span>
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleAddPiece} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Product Information (7 cols) */}
          <div className="lg:col-span-7 bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <h2 className="label-caps text-[12px] font-bold text-[var(--gold)] tracking-widest uppercase border-b border-[var(--border-color)] pb-3">
              1. Garment Identity & Pricing
            </h2>

            {/* Piece Title */}
            <div>
              <label className="block label-caps text-[11px] uppercase text-[var(--text-secondary)] font-semibold mb-1.5">
                Piece Title *
              </label>
              <input
                type="text"
                required
                value={newPiece.title}
                onChange={(e) => setNewPiece({ ...newPiece, title: e.target.value })}
                placeholder="e.g. Varanasi Handloom Silk Kurta"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] px-4 py-3 text-[14px] text-[var(--text-primary)] outline-none rounded"
              />
            </div>

            {/* Material & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block label-caps text-[11px] uppercase text-[var(--text-secondary)] font-semibold mb-1.5">
                  SKU Identifier Prefix
                </label>
                <input
                  type="text"
                  value={newPiece.sku}
                  onChange={(e) => setNewPiece({ ...newPiece, sku: e.target.value })}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-3 text-[13px] font-mono text-[var(--text-primary)] outline-none rounded"
                />
              </div>

              <div>
                <label className="block label-caps text-[11px] uppercase text-[var(--text-secondary)] font-semibold mb-1.5">
                  Fabric / Material Composition
                </label>
                <input
                  type="text"
                  value={newPiece.material}
                  onChange={(e) => setNewPiece({ ...newPiece, material: e.target.value })}
                  placeholder="e.g. Pure Mulberry Silk with Antique Zari"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-3 text-[13px] text-[var(--text-primary)] outline-none rounded"
                />
              </div>
            </div>

            {/* Price (INR) & Initial Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block label-caps text-[11px] uppercase text-[var(--text-secondary)] font-semibold mb-1.5">
                  Base Price (INR ₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newPiece.price}
                  onChange={(e) => setNewPiece({ ...newPiece, price: e.target.value })}
                  placeholder="24500"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] px-4 py-3 text-[15px] font-bold text-[var(--text-primary)] outline-none rounded"
                />
              </div>

              <div>
                <label className="block label-caps text-[11px] uppercase text-[var(--text-secondary)] font-semibold mb-1.5">
                  Total Initial Stock (All Variants) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newPiece.stock}
                  onChange={(e) => setNewPiece({ ...newPiece, stock: e.target.value })}
                  placeholder="10"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] px-4 py-3 text-[14px] text-[var(--text-primary)] outline-none rounded"
                />
              </div>
            </div>

            {/* Collection / Category Selector */}
            <div className="relative">
              <div className="flex justify-between items-center mb-1.5">
                <label className="label-caps text-[11px] uppercase text-[var(--text-secondary)] font-semibold">
                  Collection (Category) *
                </label>
                <button
                  type="button"
                  onClick={() => setSubView('collections')}
                  className="text-[11px] text-[var(--gold)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} />
                  <span>Manage Collections</span>
                </button>
              </div>

              {/* Custom Luxury Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setIsCollectionDropdownOpen(!isCollectionDropdownOpen)}
                className={`w-full bg-[var(--bg-secondary)] border px-4 py-3 text-left flex items-center justify-between transition-all rounded cursor-pointer ${
                  isCollectionDropdownOpen
                    ? 'border-[var(--gold)] ring-1 ring-[var(--gold)]/40 shadow-lg'
                    : 'border-[var(--border-color)] hover:border-[var(--gold)]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[14px] font-medium text-[var(--text-primary)] truncate">
                    {newPiece.collectionTag || 'Select Collection'}
                  </span>
                  {(() => {
                    const activeCat = categories.find((c) => c.name === newPiece.collectionTag);
                    return activeCat ? (
                      <span className="label-caps text-[9px] text-[var(--gold)] bg-[var(--gold)]/10 px-2 py-0.5 rounded font-mono shrink-0">
                        /{activeCat.slug}
                      </span>
                    ) : null;
                  })()}
                </div>
                <ChevronDown
                  size={16}
                  className={`text-[var(--text-secondary)] transition-transform duration-300 shrink-0 ml-2 ${
                    isCollectionDropdownOpen ? 'rotate-180 text-[var(--gold)]' : ''
                  }`}
                />
              </button>

              {/* Custom Dropdown Options Menu */}
              {isCollectionDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsCollectionDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1.5 z-30 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl rounded-lg overflow-hidden divide-y divide-[var(--border-color)]/60 animate-in fade-in zoom-in-95 duration-150">
                    <div className="max-h-60 overflow-y-auto">
                      {categories.map((cat) => {
                        const isSelected = newPiece.collectionTag === cat.name;
                        return (
                          <button
                            key={cat.id || cat.name}
                            type="button"
                            onClick={() => {
                              setNewPiece({ ...newPiece, collectionTag: cat.name });
                              setIsCollectionDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors cursor-pointer group ${
                              isSelected
                                ? 'bg-[var(--gold)]/15 text-[var(--gold)] font-bold'
                                : 'hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`text-[13.5px] truncate ${isSelected ? 'text-[var(--gold)]' : 'group-hover:text-[var(--gold)]'}`}>
                                {cat.name}
                              </span>
                              <span className="text-[10px] text-[var(--text-secondary)] font-mono opacity-80">
                                ({cat.slug})
                              </span>
                            </div>
                            {isSelected && (
                              <Check size={16} className="text-[var(--gold)] shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Size Selector from Master */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block label-caps text-[11px] uppercase text-[var(--text-secondary)] font-semibold">
                  Available Sizes ({newPiece.sizes.length} selected) *
                </label>
                <button
                  type="button"
                  onClick={() => setSubView('color_size_master')}
                  className="text-[11px] text-[var(--gold)] hover:underline"
                >
                  Edit Size Master
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {masterSizes.map((sz) => {
                  const isSelected = newPiece.sizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => {
                        const current = newPiece.sizes;
                        const next = isSelected
                          ? current.filter((s) => s !== sz)
                          : [...current, sz];
                        setNewPiece({ ...newPiece, sizes: next });
                      }}
                      className={`px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-wider border rounded transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--gold)] text-black border-[var(--gold)] shadow-sm'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--gold)]'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Colors & Per-Color Images (0 to 3 images) (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
                <h2 className="label-caps text-[12px] font-bold text-[var(--gold)] tracking-widest uppercase">
                  2. Color Variants & Photos (0-3 Per Color)
                </h2>
                <button
                  type="button"
                  onClick={() => setSubView('color_size_master')}
                  className="text-[11px] text-[var(--gold)] hover:underline"
                >
                  Edit Colors
                </button>
              </div>

              {/* Color Swatch Selector */}
              <div>
                <label className="block text-[11px] uppercase text-[var(--text-secondary)] font-semibold mb-2">
                  Select Colors for this Piece
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {masterColors.map((color) => {
                    const isSelected = newPiece.colors.some((c) => c.name === color.name);
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => handleToggleColor(color)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--text-primary)] ring-1 ring-[var(--gold)]'
                            : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-[12px] font-medium">{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Per-Color Image Upload Panels */}
              <div className="space-y-4 pt-2">
                {newPiece.colors.map((color, colorIdx) => (
                  <div
                    key={color.name}
                    className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                          {color.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-[var(--text-secondary)]">
                        {color.images.length}/3 Photos
                      </span>
                    </div>

                    {/* Image Thumbnails & Upload Button */}
                    <div className="grid grid-cols-3 gap-2.5">
                      {color.images.map((imgUrl, imgIdx) => (
                        <div
                          key={imgIdx}
                          className="aspect-[3/4] rounded bg-black/40 border border-[var(--border-color)] relative overflow-hidden group"
                        >
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveColorImage(colorIdx, imgIdx)}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 cursor-pointer"
                            title="Remove image"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}

                      {color.images.length < 3 && (
                        <label className="aspect-[3/4] rounded border-2 border-dashed border-[var(--border-color)] hover:border-[var(--gold)] bg-[var(--bg-card)]/40 flex flex-col items-center justify-center gap-1 text-[var(--text-secondary)] hover:text-[var(--gold)] cursor-pointer transition-colors p-2 text-center">
                          {uploadingColorIdx === colorIdx ? (
                            <Loader2 size={18} className="animate-spin text-[var(--gold)]" />
                          ) : (
                            <>
                              <Upload size={16} />
                              <span className="text-[10px] font-semibold uppercase tracking-wider">
                                Upload Photo
                              </span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingColorIdx === colorIdx}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleColorImageUpload(colorIdx, e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 space-y-3">
              <button
                type="submit"
                className="w-full bg-[var(--gold)] text-[#0A0A0A] font-semibold label-caps text-[12px] tracking-widest uppercase py-4 shadow-xl hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
              >
                Publish & Mint Piece to Vault
              </button>

              <button
                type="button"
                onClick={() => setSubView('list')}
                className="w-full border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] label-caps text-[11px] tracking-widest uppercase py-3 transition-colors cursor-pointer"
              >
                Cancel & Return
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // ==========================================
  // VIEW: DEDICATED COLLECTION MASTER PAGE
  // ==========================================
  if (subView === 'collections') {
    return (
      <div className="p-4 sm:p-6 md:p-10 max-w-[1440px] w-full mx-auto space-y-8 flex-1 min-w-0 font-manrope">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSubView('list')}
              className="p-2 border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title="Back to Inventory"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <span className="label-caps text-[10px] sm:text-[11px] text-[var(--gold)] tracking-widest uppercase">
                CURATION TAXONOMY
              </span>
              <h1 className="font-garamond text-[26px] sm:text-[34px] text-[var(--text-primary)] font-normal tracking-tight">
                Collection Master
              </h1>
            </div>
          </div>
        </div>

        {/* Architectural Explanation Banner */}
        <div className="p-5 bg-[var(--bg-card)] border border-[var(--gold)]/30 rounded-lg flex items-start gap-4 text-[13px]">
          <div className="w-8 h-8 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] flex items-center justify-center shrink-0 mt-0.5">
            <Info size={18} />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-[var(--text-primary)] text-[14px]">
              What are Collections in Ithihasa?
            </h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Collections represent the luxury category taxonomy of the boutique (e.g. <em>Heritage Sarees, Bandhgalas, Royal Shawls, Atelier Bespoke</em>). In the customer-facing Storefront application (`/shop`), products are grouped and filtered <strong>collection-wise</strong>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Active Collections List (7 cols) */}
          <div className="lg:col-span-7 bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h2 className="label-caps text-[12px] font-bold text-[var(--gold)] tracking-widest uppercase">
                Active Atelier Collections ({categories.length})
              </h2>
            </div>

            {categories.length === 0 ? (
              <div className="p-8 text-center bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <Tag size={24} className="mx-auto text-[var(--text-secondary)] opacity-40 mb-2" />
                <p className="text-[13px] text-[var(--text-secondary)]">No collections created yet. Use the form to create your first collection.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-color)] border border-[var(--border-color)] bg-[var(--bg-secondary)]/20">
                {categories.map((cat) => (
                  <div key={cat.id || cat.slug} className="p-4 flex items-center justify-between gap-4 hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[14px] text-[var(--text-primary)]">{cat.name}</span>
                        <span className="label-caps text-[10px] text-[var(--gold)] bg-[var(--gold)]/10 px-2 py-0.5 rounded font-mono">
                          /{cat.slug}
                        </span>
                      </div>
                      <p className="text-[12px] text-[var(--text-secondary)] line-clamp-1">{cat.description || 'Atelier luxury collection'}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteCategory(cat.id || cat.slug, cat.name)}
                      className="p-2 text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                      title="Remove Collection"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create New Collection Form (5 cols) */}
          <div className="lg:col-span-5 bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 space-y-5">
            <h2 className="label-caps text-[12px] font-bold text-[var(--gold)] tracking-widest uppercase border-b border-[var(--border-color)] pb-3">
              Create New Collection
            </h2>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block label-caps text-[11px] uppercase text-[var(--text-secondary)] font-semibold mb-1.5">
                  Collection Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Royal Brocade & Zari"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] px-4 py-2.5 text-[13.5px] text-[var(--text-primary)] outline-none rounded"
                />
              </div>

              <div>
                <label className="block label-caps text-[11px] uppercase text-[var(--text-secondary)] font-semibold mb-1.5">
                  Description / Editorial Note
                </label>
                <textarea
                  rows={3}
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  placeholder="Handcrafted silk weaves and metallic zari..."
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] px-4 py-2.5 text-[13px] text-[var(--text-primary)] outline-none rounded"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--gold)] text-black font-semibold label-caps text-[12px] uppercase tracking-wider py-3 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <FolderPlus size={15} />
                <span>Save Collection to Master</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: DEDICATED PIECE SPECIFICATIONS PAGE
  // ==========================================
  if (subView === 'piece_details' && selectedPiece) {
    return (
      <div className="p-4 sm:p-6 md:p-10 max-w-[1440px] w-full mx-auto space-y-8 flex-1 min-w-0 font-manrope">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSelectedPiece(null);
                setSubView('list');
              }}
              className="p-2 border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title="Back to Inventory"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <span className="label-caps text-[10px] sm:text-[11px] text-[var(--gold)] tracking-widest uppercase">
                PIECE SPECIFICATIONS
              </span>
              <h1 className="font-garamond text-[26px] sm:text-[34px] text-[var(--text-primary)] font-normal tracking-tight">
                {selectedPiece.title}
              </h1>
            </div>
          </div>

          <button
            onClick={() => handleDeletePiece(selectedPiece.id)}
            className="px-4 py-2.5 border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 label-caps text-[11px] uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            <span>Delete Piece</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Piece Image Display (5 cols) */}
          <div className="lg:col-span-5 bg-[var(--bg-card)] border border-[var(--border-color)] p-6 space-y-4">
            <div className="aspect-[3/4] w-full bg-[var(--bg-secondary)] overflow-hidden border border-[var(--border-color)] relative">
              {selectedPiece.image ? (
                <img src={selectedPiece.image} alt={selectedPiece.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)] opacity-40">
                  <Package size={48} />
                </div>
              )}
            </div>
          </div>

          {/* Piece Parameters & Stock Adjustments (7 cols) */}
          <div className="lg:col-span-7 bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <h2 className="label-caps text-[12px] font-bold text-[var(--gold)] tracking-widest uppercase border-b border-[var(--border-color)] pb-3">
              Vault & Inventory Metrics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 border border-[var(--border-color)] bg-[var(--bg-secondary)]/30 text-[13.5px]">
              <div>
                <span className="text-[var(--text-secondary)] label-caps text-[10px] uppercase block mb-1">SKU</span>
                <span className="font-mono font-medium text-[var(--text-primary)]">{selectedPiece.sku}</span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] label-caps text-[10px] uppercase block mb-1">Price</span>
                <span className="font-bold text-[var(--text-primary)] text-[16px]">{formatINR(selectedPiece.price)}</span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] label-caps text-[10px] uppercase block mb-1">Status</span>
                <span className={`font-semibold capitalize ${selectedPiece.stock <= 2 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {selectedPiece.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] label-caps text-[10px] uppercase block mb-1">Collection</span>
                <span className="font-semibold text-[var(--gold)]">{selectedPiece.collectionTag}</span>
              </div>
            </div>

            {/* Realtime Stock Counter */}
            <div className="p-5 border border-[var(--border-color)] bg-[var(--bg-secondary)]/40 flex items-center justify-between">
              <div>
                <span className="label-caps text-[11px] uppercase text-[var(--text-secondary)] font-semibold block">
                  On-Hand Stock In Vault
                </span>
                <span className="text-[24px] font-bold text-[var(--text-primary)] tabular-nums">
                  {selectedPiece.stock} units
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStockAdjust(selectedPiece.id, -1)}
                  className="w-10 h-10 rounded border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-primary)] hover:border-[var(--gold)] transition-colors cursor-pointer"
                  title="Decrease Stock"
                >
                  <Minus size={16} />
                </button>
                <button
                  onClick={() => handleStockAdjust(selectedPiece.id, 1)}
                  className="w-10 h-10 rounded border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-primary)] hover:border-[var(--gold)] transition-colors cursor-pointer"
                  title="Increase Stock"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div>
              <span className="label-caps text-[11px] uppercase text-[var(--text-secondary)] font-semibold block mb-1">
                Fabric Details
              </span>
              <p className="text-[14px] text-[var(--text-secondary)]">
                {selectedPiece.material}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: MAIN INVENTORY CATALOG (DEFAULT)
  // ==========================================
  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-[1440px] w-full mx-auto space-y-6 md:space-y-8 flex-1 min-w-0 font-manrope">
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
          {/* Color & Size Master Action */}
          <button
            onClick={() => setSubView('color_size_master')}
            className="flex-1 sm:flex-none border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-primary)] px-3.5 py-2.5 sm:py-3 transition-colors flex items-center justify-center gap-2 label-caps text-[11px] uppercase tracking-wider font-semibold cursor-pointer shadow-sm"
          >
            <Palette size={14} className="text-[var(--gold)]" />
            <span>Color & Size Master</span>
          </button>

          {/* Collection Master Action Button */}
          <button
            onClick={() => setSubView('collections')}
            className="flex-1 sm:flex-none border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-primary)] px-3.5 py-2.5 sm:py-3 transition-colors flex items-center justify-center gap-2 label-caps text-[11px] uppercase tracking-wider font-semibold cursor-pointer shadow-sm"
          >
            <Tag size={14} className="text-[var(--gold)]" />
            <span>Collection Master ({categories.length})</span>
          </button>

          {/* Add Piece Action Button */}
          <button
            onClick={() => setSubView('new_piece')}
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
            className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[var(--gold)] text-[var(--text-primary)] text-[13.5px] pl-10 pr-4 py-2.5 outline-none transition-colors"
          />
        </div>

        <div className="flex items-center justify-end gap-2 text-[12px] text-[var(--text-secondary)]">
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
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-1 text-[13px] sm:text-[13.5px] no-scrollbar whitespace-nowrap">
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
          <p className="body-sm text-[13px] text-[var(--text-secondary)]">Click "Add New Piece" above to curate your first piece.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredInventory.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedPiece(item);
                setSubView('piece_details');
              }}
              className="group flex flex-col cursor-pointer border border-[var(--border-color)] bg-[var(--bg-card)] p-3 sm:p-3.5 hover:border-[var(--gold)] transition-all duration-300 shadow-sm"
            >
              {/* Image Container with 3/4 Ratio */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--bg-secondary)] mb-3">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)] opacity-30">
                    <Package size={32} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                {/* Collection Tag */}
                {item.collectionTag && (
                  <span className="absolute top-2 left-2 label-caps text-[9px] bg-black/80 text-[var(--gold)] px-2 py-0.5 border border-white/10 uppercase tracking-widest">
                    {item.collectionTag}
                  </span>
                )}

                {/* Stock Status Badge */}
                <span
                  className={`absolute top-2 right-2 px-2 py-0.5 label-caps text-[9px] uppercase tracking-wider font-semibold border ${
                    item.stock <= 2
                      ? 'bg-rose-950/90 text-rose-300 border-rose-800'
                      : 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
                  }`}
                >
                  {item.stock} left
                </span>
              </div>

              {/* Card Meta */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[11px] font-mono text-[var(--text-secondary)]">{item.sku}</span>
                    <span className="text-[14px] font-semibold text-[var(--text-primary)] tabular-nums">
                      {formatINR(item.price)}
                    </span>
                  </div>
                  <h3 className="font-garamond text-[17px] sm:text-[18px] text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors leading-snug line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-[12px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">{item.material}</p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--border-color)]">
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleStockAdjust(item.id, -1)}
                      className="w-6 h-6 rounded border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--gold)] cursor-pointer"
                      title="Decrease stock"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-[12px] font-semibold text-[var(--text-primary)] min-w-[20px] text-center tabular-nums">
                      {item.stock}
                    </span>
                    <button
                      onClick={() => handleStockAdjust(item.id, 1)}
                      className="w-6 h-6 rounded border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--gold)] cursor-pointer"
                      title="Increase stock"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePiece(item.id);
                    }}
                    className="text-[var(--text-secondary)] hover:text-rose-500 p-1 cursor-pointer transition-colors"
                    title="Delete piece"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Mode */
        <div className="border border-[var(--border-color)] bg-[var(--bg-card)] overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-[11px] label-caps uppercase tracking-wider text-[var(--text-secondary)]">
                <th className="p-3.5">Piece</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Collection</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[13px]">
              {filteredInventory.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => {
                    setSelectedPiece(item);
                    setSubView('piece_details');
                  }}
                  className="hover:bg-[var(--bg-secondary)]/40 transition-colors cursor-pointer"
                >
                  <td className="p-3.5 flex items-center gap-3">
                    <div className="w-10 h-12 bg-[var(--bg-secondary)] overflow-hidden shrink-0 border border-[var(--border-color)]">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)] opacity-30">
                          <Package size={16} />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--text-primary)] line-clamp-1">{item.title}</span>
                      <span className="text-[11.5px] text-[var(--text-secondary)] line-clamp-1">{item.material}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-[12px] text-[var(--text-secondary)]">{item.sku}</td>
                  <td className="p-3.5 text-[var(--gold)] font-medium">{item.collectionTag}</td>
                  <td className="p-3.5 font-semibold text-[var(--text-primary)] tabular-nums">{formatINR(item.price)}</td>
                  <td className="p-3.5">
                    <span className={item.stock <= 2 ? 'text-rose-500 font-semibold' : 'text-emerald-500 font-semibold'}>
                      {item.stock} in stock
                    </span>
                  </td>
                  <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleDeletePiece(item.id)}
                      className="p-1.5 text-[var(--text-secondary)] hover:text-rose-500 transition-colors cursor-pointer"
                      title="Delete Piece"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
