import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  Layers,
  Compass,
  Tag,
  Eye,
  RefreshCw
} from 'lucide-react';
import { fetchStorefrontCMS, updateStorefrontCMS } from '../api/merchandising.js';
import { toast } from 'sonner';

const HERO_IMAGE_PRESETS = [
  {
    label: 'Heirloom Brocade Gold',
    url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=2000&q=85'
  },
  {
    label: 'Kanchipuram Raw Silk',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=85'
  },
  {
    label: 'Velvet Royal Silhouette',
    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=2000&q=85'
  },
  {
    label: 'Varanasi Weave Atelier',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=2000&q=85'
  }
];

export function StorefrontCMSView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Hero Banner State
  const [heroTitle, setHeroTitle] = useState('The Heritage Collection');
  const [heroSubtitle, setHeroSubtitle] = useState('Wear Your Legacy.');
  const [heroDescription, setHeroDescription] = useState('Quiet luxury handcrafted for timeless dignity.');
  const [heroImageUrl, setHeroImageUrl] = useState(HERO_IMAGE_PRESETS[0].url);
  const [heroCtaText, setHeroCtaText] = useState('EXPLORE COLLECTION');
  const [heroCtaLink, setHeroCtaLink] = useState('/shop');

  // 2. Highlighted 2 Silhouettes
  const [highlightedItems, setHighlightedItems] = useState([
    {
      id: 'h1',
      title: 'Kanchipuram Heirloom Silk Saree',
      categoryTag: 'Heritage Saree',
      price: 34500,
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      slug: 'kanchipuram-heirloom-silk-saree'
    },
    {
      id: 'h2',
      title: 'Imperial Velvet Bandhgala Jacket',
      categoryTag: 'Bandhgalas & Jackets',
      price: 48000,
      imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
      slug: 'imperial-velvet-bandhgala-jacket'
    }
  ]);

  // 3. Trending Collections
  const [trendingCollections, setTrendingCollections] = useState([
    {
      name: 'Heritage Kurtas',
      slug: 'heritage-kurtas',
      itemCount: 14,
      imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Bandhgalas & Jackets',
      slug: 'bandhgalas-jackets',
      itemCount: 8,
      imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Royal Shawls & Stoles',
      slug: 'royal-shawls-stoles',
      itemCount: 12,
      imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Atelier Bespoke',
      slug: 'atelier-bespoke',
      itemCount: 6,
      imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80'
    }
  ]);

  // Load from live backend
  useEffect(() => {
    async function loadCMS() {
      try {
        setLoading(true);
        const data = await fetchStorefrontCMS().catch(() => null);
        if (data) {
          if (data.hero) {
            if (data.hero.title) setHeroTitle(data.hero.title);
            if (data.hero.subtitle) setHeroSubtitle(data.hero.subtitle);
            if (data.hero.description) setHeroDescription(data.hero.description);
            if (data.hero.imageUrl) setHeroImageUrl(data.hero.imageUrl);
            if (data.hero.ctaText) setHeroCtaText(data.hero.ctaText);
            if (data.hero.ctaLink) setHeroCtaLink(data.hero.ctaLink);
          }
          if (data.highlightedItems && Array.isArray(data.highlightedItems) && data.highlightedItems.length > 0) {
            setHighlightedItems(data.highlightedItems);
          }
          if (data.trendingCollections && Array.isArray(data.trendingCollections) && data.trendingCollections.length > 0) {
            setTrendingCollections(data.trendingCollections);
          }
        }
      } catch (err) {
        console.warn('CMS load note:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadCMS();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateStorefrontCMS({
        hero: {
          title: heroTitle,
          subtitle: heroSubtitle,
          description: heroDescription,
          imageUrl: heroImageUrl,
          ctaText: heroCtaText,
          ctaLink: heroCtaLink
        },
        highlightedItems,
        trendingCollections
      });
      toast.success('Storefront Merchandising CMS updated successfully! Live in customer app.');
    } catch (err) {
      toast.error(err.message || 'Failed to update Storefront CMS');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateHighlighted = (index, field, value) => {
    const updated = [...highlightedItems];
    updated[index] = { ...updated[index], [field]: value };
    setHighlightedItems(updated);
  };

  const handleAddCollectionTag = () => {
    const newTag = {
      name: 'New Heritage Collection',
      slug: 'new-collection',
      itemCount: 4,
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
    };
    setTrendingCollections([...trendingCollections, newTag]);
  };

  const handleRemoveCollectionTag = (index) => {
    setTrendingCollections(trendingCollections.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-[1440px] w-full mx-auto space-y-8 flex-1">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-[var(--gold)]" />
            <span className="label-caps tracking-widest text-[11px] uppercase text-[var(--gold)] font-bold">
              Dynamic Merchandising Suite
            </span>
          </div>
          <h1
            className="text-[28px] sm:text-[36px] font-normal text-[var(--text-primary)] tracking-wide"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            Storefront & Homepage CMS
          </h1>
          <p className="body-sm text-[13px] sm:text-[14px] text-[var(--text-secondary)]">
            Configure the customer homepage hero banner, the 2 highlighted silhouettes, and trending collections in real-time.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--gold)] text-[#0A0A0A] font-semibold label-caps text-[12px] tracking-widest uppercase hover:brightness-110 active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Publish to Live App</span>
            </>
          )}
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[var(--text-secondary)]">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="label-caps text-[12px] tracking-widest uppercase">Loading Storefront CMS...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-10">
          {/* SECTION 1: HOMEPAGE HERO BANNER */}
          <section className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 rounded-lg shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--gold)]">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h2
                    className="text-[20px] sm:text-[24px] font-normal text-[var(--text-primary)]"
                    style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                  >
                    1. Hero Banner Behind "Explore Collection"
                  </h2>
                  <p className="text-[12px] text-[var(--text-secondary)]">
                    The primary visual showcase of the Ithihasa mobile and desktop storefront.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="relative w-full h-64 sm:h-80 bg-[var(--bg-secondary)] border border-[var(--border-color)] overflow-hidden flex items-end justify-center pb-8 px-6 text-center">
              <img
                src={heroImageUrl}
                alt="Hero Preview"
                className="absolute inset-0 w-full h-full object-cover brightness-75"
              />
              <div className="absolute inset-0 bg-black/35" />
              <div className="relative z-10 text-white max-w-lg mx-auto">
                <h3
                  className="text-[24px] sm:text-[32px] uppercase tracking-widest font-normal mb-1"
                  style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                >
                  {heroTitle || 'The Heritage Collection'}
                </h3>
                <p className="text-[13px] sm:text-[14px] text-white/90 mb-4 tracking-wide font-light">
                  {heroSubtitle || 'Wear Your Legacy.'}
                </p>
                <div className="inline-block bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-[11px] font-bold tracking-widest px-5 py-2.5 uppercase border border-white/20">
                  {heroCtaText || 'EXPLORE COLLECTION'}
                </div>
              </div>
            </div>

            {/* Image Presets Selector */}
            <div>
              <label className="label-caps text-[11px] uppercase tracking-wider text-[var(--text-secondary)] block mb-2 font-semibold">
                Quick Luxury Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {HERO_IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setHeroImageUrl(preset.url)}
                    className={`relative h-20 border text-left p-2 overflow-hidden transition-all group ${
                      heroImageUrl === preset.url
                        ? 'border-[var(--gold)] ring-1 ring-[var(--gold)]'
                        : 'border-[var(--border-color)] hover:border-[var(--gold)]'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform"
                    />
                    <span className="relative z-10 text-white text-[11px] font-semibold block leading-tight">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Banner Form Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label-caps text-[11px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5 font-semibold">
                  Hero Headline Title
                </label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] focus:border-[var(--gold)] outline-none rounded"
                />
              </div>

              <div>
                <label className="label-caps text-[11px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5 font-semibold">
                  Hero Subtitle
                </label>
                <input
                  type="text"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] focus:border-[var(--gold)] outline-none rounded"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label-caps text-[11px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5 font-semibold">
                  Background Image URL
                </label>
                <input
                  type="url"
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2.5 text-[13px] font-mono text-[var(--text-primary)] focus:border-[var(--gold)] outline-none rounded"
                />
              </div>

              <div>
                <label className="label-caps text-[11px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5 font-semibold">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={heroCtaText}
                  onChange={(e) => setHeroCtaText(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] focus:border-[var(--gold)] outline-none rounded"
                />
              </div>

              <div>
                <label className="label-caps text-[11px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5 font-semibold">
                  CTA Destination Link
                </label>
                <input
                  type="text"
                  value={heroCtaLink}
                  onChange={(e) => setHeroCtaLink(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] focus:border-[var(--gold)] outline-none rounded"
                />
              </div>
            </div>
          </section>

          {/* SECTION 2: 2 HIGHLIGHTED ATELIER ITEMS */}
          <section className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 rounded-lg shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--gold)]">
                <Compass size={20} />
              </div>
              <div>
                <h2
                  className="text-[20px] sm:text-[24px] font-normal text-[var(--text-primary)]"
                  style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                >
                  2. Two Highlighted Silhouettes Above "View All"
                </h2>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  The twin signature pieces presented to patrons immediately beneath the hero banner.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {highlightedItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="label-caps text-[11px] font-bold text-[var(--gold)] tracking-widest uppercase">
                      Highlighted Piece #{idx + 1}
                    </span>
                    <span className="text-[13px] font-semibold text-[var(--text-primary)] tabular-nums">
                      ₹{Number(item.price || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-24 bg-black border border-[var(--border-color)] shrink-0 overflow-hidden rounded">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="text-[10.5px] uppercase text-[var(--text-secondary)] font-semibold block">
                          Piece Title
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleUpdateHighlighted(idx, 'title', e.target.value)}
                          className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-1.5 text-[13px] text-[var(--text-primary)] outline-none rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10.5px] uppercase text-[var(--text-secondary)] font-semibold block">
                          Category Label
                        </label>
                        <input
                          type="text"
                          value={item.categoryTag}
                          onChange={(e) => handleUpdateHighlighted(idx, 'categoryTag', e.target.value)}
                          className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-1.5 text-[13px] text-[var(--text-primary)] outline-none rounded"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10.5px] uppercase text-[var(--text-secondary)] font-semibold block">
                        Price (₹ INR)
                      </label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleUpdateHighlighted(idx, 'price', Number(e.target.value))}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-1.5 text-[13px] tabular-nums text-[var(--text-primary)] outline-none rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10.5px] uppercase text-[var(--text-secondary)] font-semibold block">
                        Target Product Slug
                      </label>
                      <input
                        type="text"
                        value={item.slug}
                        onChange={(e) => handleUpdateHighlighted(idx, 'slug', e.target.value)}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-1.5 text-[13px] text-[var(--text-primary)] outline-none rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10.5px] uppercase text-[var(--text-secondary)] font-semibold block">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={item.imageUrl}
                      onChange={(e) => handleUpdateHighlighted(idx, 'imageUrl', e.target.value)}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-1.5 text-[12px] font-mono text-[var(--text-primary)] outline-none rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 3: TRENDING COLLECTIONS TAGS */}
          <section className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 rounded-lg shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--gold)]">
                  <Tag size={20} />
                </div>
                <div>
                  <h2
                    className="text-[20px] sm:text-[24px] font-normal text-[var(--text-primary)]"
                    style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                  >
                    3. Trending Collections & Search Badges
                  </h2>
                  <p className="text-[12px] text-[var(--text-secondary)]">
                    Appears in search suggestions, discovery drawers, and collection navigation chips.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddCollectionTag}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-primary)] label-caps text-[11px] tracking-wider uppercase rounded"
              >
                <Plus size={14} />
                <span>Add Collection Tag</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingCollections.map((col, idx) => (
                <div
                  key={idx}
                  className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-lg space-y-3 relative group"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveCollectionTag(idx)}
                    className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-red-500 transition-colors p-1"
                    title="Remove tag"
                  >
                    <Trash2 size={15} />
                  </button>

                  <div className="flex items-center gap-3">
                    <img
                      src={col.imageUrl}
                      alt={col.name}
                      className="w-12 h-14 object-cover rounded border border-[var(--border-color)]"
                    />
                    <div className="min-w-0 flex-1">
                      <input
                        type="text"
                        value={col.name}
                        onChange={(e) => {
                          const updated = [...trendingCollections];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          setTrendingCollections(updated);
                        }}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-2 py-1 text-[13px] font-semibold text-[var(--text-primary)] outline-none rounded"
                      />
                      <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">
                        {col.itemCount} items
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-[var(--text-secondary)] font-semibold block">
                      Category Route Slug
                    </label>
                    <input
                      type="text"
                      value={col.slug}
                      onChange={(e) => {
                        const updated = [...trendingCollections];
                        updated[idx] = { ...updated[idx], slug: e.target.value };
                        setTrendingCollections(updated);
                      }}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-2 py-1 text-[12px] font-mono text-[var(--text-primary)] outline-none rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom Save Action */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--gold)] text-[#0A0A0A] font-semibold label-caps text-[13px] tracking-widest uppercase hover:brightness-110 active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
            >
              <Save size={16} />
              <span>{saving ? 'Publishing Changes...' : 'Save & Publish Merchandising'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
