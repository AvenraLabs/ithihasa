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
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  Box
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
  const [pieceDetailsColorFilter, setPieceDetailsColorFilter] = useState('all');
  const [customRestockQty, setCustomRestockQty] = useState({});

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
    collectionTag: '',
    sizes: ['38', '40', '42', 'Free Size'],
    colors: [
      { name: 'Midnight Noir', hex: '#0A0A0A', images: [] }
    ],
    // Map of `${colorName}___${size}` -> stock number
    variantStocks: {
      'Midnight Noir___38': 5,
      'Midnight Noir___40': 5,
      'Midnight Noir___42': 5,
      'Midnight Noir___Free Size': 5
    }
  });

  const [bulkStockVal, setBulkStockVal] = useState(10);
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
          const rawVariants = p.variants || [];
          const variants = rawVariants.map((v) => {
            const stockOnHand = v.inventory?.on_hand ?? 0;
            return {
              id: v.id,
              sku: v.sku || `${p.sku || 'SKU'}-${(v.color || 'CLR').slice(0, 3).toUpperCase()}-${(v.size || 'SZ').replace(/\s+/g, '')}`,
              size: v.size || 'Standard',
              color: v.color || 'Standard',
              price: Number(v.price || p.base_price || 0),
              stock: stockOnHand,
              available: v.inventory?.available ?? stockOnHand,
              reserved: v.inventory?.reserved ?? 0,
              status: stockOnHand <= 0 ? 'out_of_stock' : stockOnHand <= 2 ? 'low_stock' : 'in_stock'
            };
          });

          const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

          return {
            id: p.id,
            sku: p.sku || variants[0]?.sku || `SKU-IH-${p.id.slice(0, 4)}`,
            title: p.name,
            material: p.fabric_composition || p.description || 'Heritage Textile',
            price: Number(p.base_price || 0),
            stock: totalStock,
            variants: variants,
            status: totalStock <= 0 ? 'out_of_stock' : totalStock <= 2 ? 'low_stock' : 'in_stock',
            collectionTag: p.category?.name || 'Unassigned',
            image: p.images?.[0]?.url || '',
            images: p.images || [],
            metadata: p.metadata
          };
        });

        setInventory(formatted);

        // Synchronize selected piece if currently open
        setSelectedPiece((prevSelected) => {
          if (!prevSelected) return null;
          return formatted.find((item) => item.id === prevSelected.id) || prevSelected;
        });
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

  // Adjust stock for an individual variant (or first variant fallback)
  const handleVariantStockAdjust = async (productId, variantId, delta, customReason) => {
    if (!delta || delta === 0) return;

    // Optimistic UI update across inventory list
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const updatedVariants = (item.variants || []).map((v) => {
            if (v.id === variantId) {
              const newStock = Math.max(0, v.stock + delta);
              return {
                ...v,
                stock: newStock,
                available: Math.max(0, (v.available || newStock) + delta),
                status: newStock <= 0 ? 'out_of_stock' : newStock <= 2 ? 'low_stock' : 'in_stock'
              };
            }
            return v;
          });
          const newTotalStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
          return {
            ...item,
            variants: updatedVariants,
            stock: newTotalStock,
            status: newTotalStock <= 0 ? 'out_of_stock' : newTotalStock <= 2 ? 'low_stock' : 'in_stock'
          };
        }
        return item;
      })
    );

    // Optimistic UI update on currently inspected piece
    setSelectedPiece((prev) => {
      if (!prev || prev.id !== productId) return prev;
      const updatedVariants = (prev.variants || []).map((v) => {
        if (v.id === variantId) {
          const newStock = Math.max(0, v.stock + delta);
          return {
            ...v,
            stock: newStock,
            available: Math.max(0, (v.available || newStock) + delta),
            status: newStock <= 0 ? 'out_of_stock' : newStock <= 2 ? 'low_stock' : 'in_stock'
          };
        }
        return v;
      });
      const newTotalStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
      return {
        ...prev,
        variants: updatedVariants,
        stock: newTotalStock,
        status: newTotalStock <= 0 ? 'out_of_stock' : newTotalStock <= 2 ? 'low_stock' : 'in_stock'
      };
    });

    try {
      await adjustInventoryStock({
        variantId,
        delta,
        reason: customReason || (delta > 0 ? 'MANUAL_RESTOCK' : 'MANUAL_STOCK_ADJUSTMENT')
      });
      toast.success(`Inventory updated (${delta > 0 ? `+${delta}` : delta} units)`);
    } catch (err) {
      console.error('Stock adjust error:', err);
      toast.error('Failed to update stock in database.');
      loadData();
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
    try {
      const created = await createCategory({
        name: newCategoryName.trim(),
        slug,
        description: newCategoryDesc.trim() || 'Atelier luxury collection',
        sortOrder: categories.length + 1
      });
      if (created) {
        setCategories((prev) => [...prev, created]);
        toast.success(`Collection "${created.name}" created successfully.`);
        setNewCategoryName('');
        setNewCategoryDesc('');
      }
    } catch (err) {
      console.error('Create category error:', err);
      toast.error(err.message || 'Failed to create collection');
    }
  };

  const handleDeleteCategory = async (catIdOrSlug, catName) => {
    try {
      await deleteCategory(catIdOrSlug);
      setCategories((prev) => prev.filter((c) => c.id !== catIdOrSlug && c.slug !== catIdOrSlug));
      toast.success(`Removed collection "${catName}"`);
    } catch (err) {
      console.error('Delete category error:', err);
      toast.error(err.message || 'Failed to delete collection');
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
      const nextStocks = { ...newPiece.variantStocks };
      newPiece.sizes.forEach((sz) => {
        const key = `${colorObj.name}___${sz}`;
        if (nextStocks[key] === undefined) nextStocks[key] = 5;
      });
      setNewPiece({
        ...newPiece,
        colors: [...newPiece.colors, { name: colorObj.name, hex: colorObj.hex, images: [] }],
        variantStocks: nextStocks
      });
    }
  };

  // Toggle Size Selection on Piece Form
  const handleToggleSize = (sz) => {
    const isSelected = newPiece.sizes.includes(sz);
    if (isSelected && newPiece.sizes.length === 1) {
      toast.error('At least one size must be selected');
      return;
    }
    const nextSizes = isSelected ? newPiece.sizes.filter((s) => s !== sz) : [...newPiece.sizes, sz];
    const nextStocks = { ...newPiece.variantStocks };
    if (!isSelected) {
      newPiece.colors.forEach((c) => {
        const key = `${c.name}___${sz}`;
        if (nextStocks[key] === undefined) nextStocks[key] = 5;
      });
    }
    setNewPiece({ ...newPiece, sizes: nextSizes, variantStocks: nextStocks });
  };

  // Update specific variant stock in matrix
  const handleMatrixStockChange = (colorName, sizeName, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setNewPiece((prev) => ({
      ...prev,
      variantStocks: {
        ...prev.variantStocks,
        [`${colorName}___${sizeName}`]: num
      }
    }));
  };

  // Bulk apply stock to all variants in matrix
  const handleBulkApplyStock = (val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = {};
    newPiece.colors.forEach((c) => {
      newPiece.sizes.forEach((s) => {
        updated[`${c.name}___${s}`] = num;
      });
    });
    setNewPiece((prev) => ({ ...prev, variantStocks: updated }));
    toast.success(`Set ${num} units for all ${newPiece.colors.length * newPiece.sizes.length} variants.`);
  };

  // Calculate total initial stock across all variant cells
  const totalCalculatedInitialStock = newPiece.colors.reduce((total, c) => {
    return (
      total +
      newPiece.sizes.reduce((sum, s) => {
        const key = `${c.name}___${s}`;
        return sum + (newPiece.variantStocks[key] ?? 5);
      }, 0)
    );
  }, 0);

  const handleAddPiece = async (e) => {
    e.preventDefault();
    if (!newPiece.title || !newPiece.price) {
      toast.error('Please enter piece title and base price');
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

      // Generate all (Color x Size) variants with exact individual stock
      const variantsPayload = [];
      newPiece.colors.forEach((color) => {
        newPiece.sizes.forEach((sz) => {
          const key = `${color.name}___${sz}`;
          const stockForVariant = Math.max(0, parseInt(newPiece.variantStocks[key], 10) || 0);
          variantsPayload.push({
            sku: `${newPiece.sku}-${color.name.slice(0, 3).toUpperCase()}-${sz.replace(/\s+/g, '')}`,
            size: sz,
            color: color.name,
            price: priceVal,
            initialStock: stockForVariant
          });
        });
      });

      // Collect all images across colors
      const imagesPayload = [];
      newPiece.colors.forEach((color) => {
        color.images.forEach((imgUrl) => {
          imagesPayload.push({
            url: imgUrl,
            altText: `${newPiece.title} - ${color.name}`,
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

      toast.success(`Published "${newPiece.title}" with ${variantsPayload.length} variants (${totalCalculatedInitialStock} total units) to vault!`);
      setSubView('list');
      setNewPiece({
        title: '',
        sku: `SKU-IH-${Math.floor(1000 + Math.random() * 9000)}`,
        material: '',
        price: '',
        collectionTag: categories[0]?.name || '',
        sizes: ['38', '40', '42', 'Free Size'],
        colors: [{ name: 'Midnight Noir', hex: '#0A0A0A', images: [] }],
        variantStocks: {
          'Midnight Noir___38': 5,
          'Midnight Noir___40': 5,
          'Midnight Noir___42': 5,
          'Midnight Noir___Free Size': 5
        }
      });
      loadData();
    } catch (err) {
      console.error('Create product error:', err);
      toast.error(err.message || 'Failed to create piece in database');
    }
  };

  const allCount = inventory.length;
  const inStockCount = inventory.filter((item) => item.stock > 2).length;
  const lowStockCount = inventory.filter((item) => item.stock <= 2).length;

  const filteredInventory = inventory.filter((item) => {
    const matchesTab =
      activeFilter === 'all' ||
      (activeFilter === 'in_stock' && item.stock > 2) ||
      (activeFilter === 'low_stock' && item.stock <= 2);

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
                    className="p-1.5 text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                    title="Remove color"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Color Form */}
            <form onSubmit={handleAddColorMaster} className="space-y-4 pt-4 border-t border-[var(--border-color)]">
              <span className="label-caps text-[10px] uppercase text-[var(--gold)] font-bold block">
                ADD NEW COLOR TO MASTER
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] uppercase mb-1">Color Name</label>
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
                  <label className="block text-[11px] text-[var(--text-secondary)] uppercase mb-1">Hex Color Code</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-9 h-9 p-0.5 bg-transparent border border-[var(--border-color)] rounded cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      required
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      placeholder="#1B4D3E"
                      className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] px-3 py-2 text-[13px] font-mono text-[var(--text-primary)] outline-none rounded uppercase"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--gold)] text-black font-semibold label-caps text-[11px] uppercase tracking-wider py-2.5 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5 rounded"
              >
                <Plus size={14} />
                <span>Add Color to Palette</span>
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
                  Available size taxonomy selectable when authoring atelier silhouettes.
                </p>
              </div>
            </div>

            {/* Active Sizes Badges */}
            <div className="flex flex-wrap gap-2.5 max-h-72 overflow-y-auto pr-1">
              {masterSizes.map((sz) => (
                <div
                  key={sz}
                  className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded group"
                >
                  <span className="text-[13px] font-semibold text-[var(--text-primary)] font-mono">{sz}</span>
                  <button
                    onClick={() => handleDeleteSizeMaster(sz)}
                    className="text-[var(--text-secondary)] hover:text-rose-500 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title={`Delete size ${sz}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Size Form */}
            <form onSubmit={handleAddSizeMaster} className="space-y-4 pt-4 border-t border-[var(--border-color)]">
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
        <form onSubmit={handleAddPiece} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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

              {/* Base Price (INR) & Category */}
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
                      <span>Manage</span>
                    </button>
                  </div>

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
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-[var(--text-secondary)] transition-transform duration-300 shrink-0 ml-2 ${
                        isCollectionDropdownOpen ? 'rotate-180 text-[var(--gold)]' : ''
                      }`}
                    />
                  </button>

                  {isCollectionDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsCollectionDropdownOpen(false)} />
                      <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-[var(--bg-card)] border border-[var(--gold)]/40 shadow-2xl max-h-60 overflow-y-auto">
                        {categories.map((cat) => (
                          <button
                            key={cat.id || cat.slug}
                            type="button"
                            onClick={() => {
                              setNewPiece({ ...newPiece, collectionTag: cat.name });
                              setIsCollectionDropdownOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-[var(--bg-secondary)] text-[13px] text-[var(--text-primary)]"
                          >
                            <span>{cat.name}</span>
                            <span className="text-[10px] text-[var(--gold)] font-mono">/{cat.slug}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Size Selector from Master */}
              <div className="pt-2 border-t border-[var(--border-color)]">
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
                        onClick={() => handleToggleSize(sz)}
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

            {/* Right Column: Colors & Per-Color Images (5 cols) */}
            <div className="lg:col-span-5 bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
                <h2 className="label-caps text-[12px] font-bold text-[var(--gold)] tracking-widest uppercase">
                  2. Color Variants & Photos
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
                  Select Colors for this Piece ({newPiece.colors.length} active)
                </label>
                <div className="flex flex-wrap gap-2">
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
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
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
                  <div key={color.name} className="border border-[var(--border-color)] bg-[var(--bg-secondary)]/30 p-4 rounded space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: color.hex }} />
                        <span className="text-[13px] font-semibold text-[var(--text-primary)]">{color.name}</span>
                      </div>
                      <span className="text-[11px] text-[var(--text-secondary)] font-mono">{color.images.length}/3 Photos</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {color.images.map((imgUrl, imgIdx) => (
                        <div key={imgIdx} className="relative aspect-[3/4] bg-[var(--bg-secondary)] border border-[var(--border-color)] group overflow-hidden">
                          <img src={imgUrl} alt={`${color.name} view ${imgIdx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveColorImage(colorIdx, imgIdx)}
                            className="absolute top-1 right-1 p-1 bg-black/80 text-white hover:text-rose-400 rounded-full transition-colors opacity-90 hover:opacity-100 cursor-pointer"
                            title="Remove image"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}

                      {color.images.length < 3 && (
                        <label className="relative aspect-[3/4] border-2 border-dashed border-[var(--border-color)] hover:border-[var(--gold)] bg-[var(--bg-secondary)]/40 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center p-2 transition-colors">
                          <Upload size={16} className="text-[var(--text-secondary)]" />
                          <span className="label-caps text-[9px] uppercase tracking-wider text-[var(--text-secondary)]">Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleColorImageUpload(colorIdx, file);
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: Dynamic Variant Stock Matrix by Color & Size */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
              <div>
                <h2 className="label-caps text-[13px] font-bold text-[var(--gold)] tracking-widest uppercase">
                  3. Color & Size Stock Matrix (Flexible Variant Quantities)
                </h2>
                <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                  Set independent initial stock units for each specific color and size combination.
                </p>
              </div>

              {/* Quick Bulk Stock Fill Tool */}
              <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1.5 rounded">
                <span className="text-[11px] text-[var(--text-secondary)] label-caps uppercase pl-2">Batch Fill:</span>
                <input
                  type="number"
                  min="0"
                  value={bulkStockVal}
                  onChange={(e) => setBulkStockVal(e.target.value)}
                  className="w-16 bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[var(--gold)] px-2 py-1 text-[13px] font-bold text-center text-[var(--text-primary)] outline-none rounded"
                />
                <button
                  type="button"
                  onClick={() => handleBulkApplyStock(bulkStockVal)}
                  className="bg-[var(--gold)] hover:brightness-110 text-black font-semibold text-[11px] uppercase tracking-wider px-3 py-1.5 rounded transition-all cursor-pointer"
                >
                  Apply To All
                </button>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto border border-[var(--border-color)] bg-[var(--bg-secondary)]/10">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-color)] text-[11px] label-caps uppercase tracking-wider text-[var(--text-secondary)]">
                    <th className="p-3.5 min-w-[160px]">Color Variant</th>
                    {newPiece.sizes.map((sz) => (
                      <th key={sz} className="p-3.5 text-center min-w-[90px]">
                        Size {sz}
                      </th>
                    ))}
                    <th className="p-3.5 text-right min-w-[100px]">Color Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] text-[13px]">
                  {newPiece.colors.map((color) => {
                    const colorTotal = newPiece.sizes.reduce((sum, sz) => {
                      const key = `${color.name}___${sz}`;
                      return sum + (newPiece.variantStocks[key] ?? 5);
                    }, 0);

                    return (
                      <tr key={color.name} className="hover:bg-[var(--bg-secondary)]/30 transition-colors">
                        <td className="p-3.5 flex items-center gap-2.5 font-medium text-[var(--text-primary)]">
                          <span className="w-4 h-4 rounded-full border border-white/20 shadow-sm shrink-0" style={{ backgroundColor: color.hex }} />
                          <span>{color.name}</span>
                        </td>

                        {newPiece.sizes.map((sz) => {
                          const key = `${color.name}___${sz}`;
                          const stockCount = newPiece.variantStocks[key] ?? 5;

                          return (
                            <td key={sz} className="p-2.5 text-center">
                              <input
                                type="number"
                                min="0"
                                required
                                value={stockCount}
                                onChange={(e) => handleMatrixStockChange(color.name, sz, e.target.value)}
                                className="w-20 mx-auto bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[var(--gold)] p-2 text-center text-[14px] font-bold text-[var(--text-primary)] outline-none rounded transition-all shadow-inner"
                              />
                            </td>
                          );
                        })}

                        <td className="p-3.5 text-right font-bold text-[var(--gold)] tabular-nums">
                          {colorTotal} units
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-[var(--bg-secondary)]/70 border-t border-[var(--border-color)] text-[13px] font-bold">
                    <td className="p-3.5 text-[var(--text-primary)]">Grand Total (All Variants)</td>
                    {newPiece.sizes.map((sz) => {
                      const sizeTotal = newPiece.colors.reduce((sum, color) => {
                        const key = `${color.name}___${sz}`;
                        return sum + (newPiece.variantStocks[key] ?? 5);
                      }, 0);
                      return (
                        <td key={sz} className="p-3.5 text-center text-[var(--text-primary)] tabular-nums">
                          {sizeTotal}
                        </td>
                      );
                    })}
                    <td className="p-3.5 text-right text-[15px] text-[var(--gold)] tabular-nums">
                      {totalCalculatedInitialStock} units
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--border-color)]">
              <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                <Box size={16} className="text-[var(--gold)]" />
                <span>Total Variants to Mint: <strong>{newPiece.colors.length * newPiece.sizes.length}</strong></span>
                <span>•</span>
                <span>Total Vault Units: <strong>{totalCalculatedInitialStock}</strong></span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSubView('list')}
                  className="w-full sm:w-auto border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] label-caps text-[11px] tracking-widest uppercase px-6 py-3.5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-[var(--gold)] text-[#0A0A0A] font-semibold label-caps text-[11px] tracking-widest uppercase px-8 py-3.5 shadow-xl hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                >
                  Publish & Mint Piece to Vault
                </button>
              </div>
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
  // VIEW: DEDICATED PIECE SPECIFICATIONS & COLOR/SIZE STOCK MATRIX PAGE
  // ==========================================
  if (subView === 'piece_details' && selectedPiece) {
    const variants = selectedPiece.variants || [];
    const colorGroups = Array.from(new Set(variants.map((v) => v.color || 'Standard')));

    const filteredVariants = pieceDetailsColorFilter === 'all'
      ? variants
      : variants.filter((v) => v.color === pieceDetailsColorFilter);

    return (
      <div className="p-4 sm:p-6 md:p-10 max-w-[1440px] w-full mx-auto space-y-8 flex-1 min-w-0 font-manrope">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
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
              <div className="flex items-center gap-2">
                <span className="label-caps text-[10px] sm:text-[11px] text-[var(--gold)] tracking-widest uppercase">
                  PIECE SPECIFICATIONS & VAULT MATRIX
                </span>
                <span className="label-caps text-[9.5px] px-2 py-0.5 bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30">
                  {selectedPiece.collectionTag}
                </span>
              </div>
              <h1 className="font-garamond text-[26px] sm:text-[34px] text-[var(--text-primary)] font-normal tracking-tight">
                {selectedPiece.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleDeletePiece(selectedPiece.id)}
              className="px-4 py-2.5 border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 label-caps text-[11px] uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Delete Piece</span>
            </button>
          </div>
        </div>

        {/* Piece Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)]">
            <span className="text-[11px] label-caps uppercase text-[var(--text-secondary)] font-semibold block mb-1">Base Price</span>
            <span className="text-[20px] font-bold text-[var(--text-primary)] tabular-nums">{formatINR(selectedPiece.price)}</span>
          </div>

          <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)]">
            <span className="text-[11px] label-caps uppercase text-[var(--text-secondary)] font-semibold block mb-1">Total Vault Stock</span>
            <div className="flex items-center gap-2">
              <span className="text-[20px] font-bold text-[var(--text-primary)] tabular-nums">{selectedPiece.stock} units</span>
              <span className={`text-[10px] label-caps px-2 py-0.5 uppercase font-semibold ${selectedPiece.stock <= 2 ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'}`}>
                {selectedPiece.stock <= 2 ? 'Low Threshold' : 'In Stock'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)]">
            <span className="text-[11px] label-caps uppercase text-[var(--text-secondary)] font-semibold block mb-1">Color Palette</span>
            <span className="text-[16px] font-semibold text-[var(--text-primary)]">{colorGroups.length} Colors</span>
          </div>

          <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)]">
            <span className="text-[11px] label-caps uppercase text-[var(--text-secondary)] font-semibold block mb-1">Size Variants</span>
            <span className="text-[16px] font-semibold text-[var(--text-primary)]">{variants.length} Total Variants</span>
          </div>
        </div>

        {/* Detailed Color & Size Matrix Table with Manual Restock */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
            <div>
              <h2 className="label-caps text-[13px] font-bold text-[var(--gold)] tracking-widest uppercase">
                Color & Size-Wise Stock Breakdown & Manual Restock
              </h2>
              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                Inspect stock per color and size, and manually restock any variant with 1-click updates.
              </p>
            </div>

            {/* Filter by Color */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setPieceDetailsColorFilter('all')}
                className={`px-3 py-1 text-[11px] label-caps uppercase tracking-wider rounded transition-all cursor-pointer ${
                  pieceDetailsColorFilter === 'all'
                    ? 'bg-[var(--gold)] text-black font-bold'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)]'
                }`}
              >
                All Colors ({variants.length})
              </button>

              {colorGroups.map((clr) => (
                <button
                  key={clr}
                  onClick={() => setPieceDetailsColorFilter(clr)}
                  className={`px-3 py-1 text-[11px] label-caps uppercase tracking-wider rounded transition-all cursor-pointer whitespace-nowrap ${
                    pieceDetailsColorFilter === clr
                      ? 'bg-[var(--gold)] text-black font-bold'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {clr}
                </button>
              ))}
            </div>
          </div>

          {/* Variants Table */}
          <div className="overflow-x-auto border border-[var(--border-color)] bg-[var(--bg-secondary)]/10">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[var(--bg-secondary)]/60 border-b border-[var(--border-color)] text-[11px] label-caps uppercase tracking-wider text-[var(--text-secondary)]">
                  <th className="p-3.5">Color</th>
                  <th className="p-3.5">Size</th>
                  <th className="p-3.5">Variant SKU</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">On-Hand Stock</th>
                  <th className="p-3.5 text-center">Quick Adjust</th>
                  <th className="p-3.5 text-right">Manual Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[13px]">
                {filteredVariants.map((variant) => {
                  const inputVal = customRestockQty[variant.id] ?? 10;

                  return (
                    <tr key={variant.id} className="hover:bg-[var(--bg-secondary)]/30 transition-colors">
                      <td className="p-3.5 font-medium text-[var(--text-primary)]">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                            style={{
                              backgroundColor:
                                masterColors.find((c) => c.name === variant.color)?.hex || '#C9A24B'
                            }}
                          />
                          <span>{variant.color}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="label-caps text-[11px] font-bold px-2 py-0.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono">
                          {variant.size}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-[12px] text-[var(--text-secondary)]">
                        {variant.sku}
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`label-caps text-[9.5px] px-2 py-0.5 uppercase tracking-wider font-semibold border ${
                            variant.stock <= 0
                              ? 'bg-rose-950/80 text-rose-400 border-rose-800'
                              : variant.stock <= 2
                              ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          }`}
                        >
                          {variant.stock <= 0 ? 'Out of Stock' : variant.stock <= 2 ? 'Low Threshold' : 'In Stock'}
                        </span>
                      </td>

                      <td className="p-3.5 text-center font-bold text-[15px] text-[var(--text-primary)] tabular-nums">
                        {variant.stock} units
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleVariantStockAdjust(selectedPiece.id, variant.id, -1, 'MANUAL_DECREMENT')}
                            className="w-7 h-7 rounded border border-[var(--border-color)] hover:border-[var(--gold)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                            title="Decrease by 1"
                          >
                            <Minus size={13} />
                          </button>
                          <button
                            onClick={() => handleVariantStockAdjust(selectedPiece.id, variant.id, 1, 'MANUAL_INCREMENT')}
                            className="w-7 h-7 rounded border border-[var(--border-color)] hover:border-[var(--gold)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                            title="Increase by 1"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            min="1"
                            value={inputVal}
                            onChange={(e) =>
                              setCustomRestockQty({
                                ...customRestockQty,
                                [variant.id]: parseInt(e.target.value, 10) || 1
                              })
                            }
                            className="w-16 bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[var(--gold)] px-2 py-1 text-[13px] text-center font-bold text-[var(--text-primary)] outline-none rounded"
                          />
                          <button
                            onClick={() => {
                              handleVariantStockAdjust(
                                selectedPiece.id,
                                variant.id,
                                inputVal,
                                `MANUAL_RESTOCK_${variant.color}_${variant.size}`
                              );
                            }}
                            className="bg-[var(--gold)] hover:brightness-110 active:scale-95 text-black font-semibold text-[11px] uppercase tracking-wider px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Plus size={12} />
                            <span>Restock</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
          {filteredInventory.map((item) => {
            const variants = item.variants || [];
            const colorNames = Array.from(new Set(variants.map((v) => v.color)));

            return (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedPiece(item);
                  setPieceDetailsColorFilter('all');
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
                      item.stock <= 0
                        ? 'bg-rose-950/90 text-rose-300 border-rose-800'
                        : item.stock <= 2
                        ? 'bg-amber-950/90 text-amber-300 border-amber-800'
                        : 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
                    }`}
                  >
                    {item.stock} total units
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
                    <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--text-secondary)]">
                      <span className="font-semibold text-[var(--text-primary)]">{colorNames.length} Colors</span>
                      <span>•</span>
                      <span>{variants.length} Variants</span>
                    </div>

                    <span className="text-[11px] label-caps text-[var(--gold)] group-hover:underline flex items-center gap-1">
                      <span>Restock / Matrix</span>
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
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
                <th className="p-3.5">Colors & Variants</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Total Units</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[13px]">
              {filteredInventory.map((item) => {
                const variants = item.variants || [];
                const colorNames = Array.from(new Set(variants.map((v) => v.color)));

                return (
                  <tr
                    key={item.id}
                    onClick={() => {
                      setSelectedPiece(item);
                      setPieceDetailsColorFilter('all');
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
                        <span className="font-semibold text-[14px] text-[var(--text-primary)] block hover:text-[var(--gold)]">
                          {item.title}
                        </span>
                        <span className="text-[12px] text-[var(--text-secondary)] line-clamp-1">{item.material}</span>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-[12px] text-[var(--text-secondary)]">{item.sku}</td>
                    <td className="p-3.5">
                      <span className="label-caps text-[10px] bg-[var(--gold)]/10 text-[var(--gold)] px-2 py-0.5 rounded">
                        {item.collectionTag}
                      </span>
                    </td>

                    <td className="p-3.5 text-[12.5px] text-[var(--text-secondary)]">
                      <span>{colorNames.length} Colors ({variants.length} Sizes)</span>
                    </td>

                    <td className="p-3.5 font-bold text-[var(--text-primary)] tabular-nums">{formatINR(item.price)}</td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.stock <= 0
                              ? 'bg-rose-500'
                              : item.stock <= 2
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                        <span className="font-bold text-[var(--text-primary)] tabular-nums">{item.stock} units</span>
                      </div>
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPiece(item);
                          setPieceDetailsColorFilter('all');
                          setSubView('piece_details');
                        }}
                        className="p-1.5 text-[var(--gold)] hover:bg-[var(--gold)]/10 rounded transition-colors mr-2 cursor-pointer inline-flex items-center gap-1 label-caps text-[10px]"
                        title="Manage Matrix"
                      >
                        <SlidersHorizontal size={14} />
                        <span>Restock</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePiece(item.id);
                        }}
                        className="p-1.5 text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors cursor-pointer inline-flex"
                        title="Delete Piece"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
