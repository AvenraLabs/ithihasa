import {
  sequelize,
  setupModelAssociations,
  User,
  Category,
  Product,
  ProductVariant,
  ProductImage,
  Inventory,
  InventoryMovement,
  Coupon,
} from '../index.js';
import { logger } from '../../common/logger/index.js';

async function seed() {
  try {
    logger.info('🌱 Starting database seed process...');
    setupModelAssociations();
    await sequelize.sync({ force: true });

    // 1. Seed Admin User
    const [adminUser] = await User.findOrCreate({
      where: { email: 'admin@ithihasa.com' },
      defaults: {
        name: 'Ithihasa Curator',
        email: 'admin@ithihasa.com',
        role: 'ADMIN',
        status: 'ACTIVE',
        phone: '9876500001',
        password_hash: '$2a$10$wT8m9M7lB8lK7u7C6o9M4e7h7G8s8I8k8L8m8N8o8P8q8R8s8T8u8', // admin123
        phone_verified: true,
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      },
    });

    // 2. Seed Categories (Base Taxonomy)
    const categoriesData = [
      {
        name: 'Heritage Kurtas',
        slug: 'heritage-kurtas',
        description: 'Handwoven silk and fine cotton kurtas inspired by ancient royal silhouettes.',
        sortOrder: 1,
      },
      {
        name: 'Bandhgalas & Jackets',
        slug: 'bandhgalas-jackets',
        description: 'Structured evening wear featuring gold bullion hand-embroidery and pure raw silks.',
        sortOrder: 2,
      },
      {
        name: 'Dhoti & Bottoms',
        slug: 'dhoti-bottoms',
        description: 'Tailored dhotis, tapered churidars and heritage silk pyjamas.',
        sortOrder: 3,
      },
      {
        name: 'Royal Shawls & Stoles',
        slug: 'royal-shawls-stoles',
        description: 'Pure Pashmina and Banarasi brocade stoles hand-crafted by master weavers.',
        sortOrder: 4,
      },
    ];

    const categoryMap = new Map<string, Category>();
    for (const cat of categoriesData) {
      const [record] = await Category.findOrCreate({
        where: { slug: cat.slug },
        defaults: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          sort_order: cat.sortOrder,
          status: 'ACTIVE',
        },
      });
      categoryMap.set(cat.slug, record);
    }

    // 4. Seed Luxury Products
    const productsData = [
      {
        name: 'Varanasi Raw Silk Kurta',
        slug: 'varanasi-raw-silk-kurta',
        categorySlug: 'heritage-kurtas',
        basePrice: 8499.0,
        compareAtPrice: 10999.0,
        description:
          'Crafted from pure handloom Varanasi raw silk, this statement piece features subtle gold thread hand-stitching along the placket and mandarin collar. Tailored with sharp 0px geometry for a structured, regal drape.',
        featured: true,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1200&q=85',
            altText: 'Varanasi Raw Silk Kurta Front View',
            isPrimary: true,
            sortOrder: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=1200&q=85',
            altText: 'Varanasi Raw Silk Kurta Fabric Texture',
            isPrimary: false,
            sortOrder: 1,
          },
        ],
        variants: [
          { sku: 'ITH-VSK-BLK-S', size: 'S', color: 'Midnight Ink', price: 8499.0, stock: 12 },
          { sku: 'ITH-VSK-BLK-M', size: 'M', color: 'Midnight Ink', price: 8499.0, stock: 18 },
          { sku: 'ITH-VSK-BLK-L', size: 'L', color: 'Midnight Ink', price: 8499.0, stock: 15 },
          { sku: 'ITH-VSK-BLK-XL', size: 'XL', color: 'Midnight Ink', price: 8499.0, stock: 8 },
        ],
      },
      {
        name: 'Imperial Velvet Bandhgala',
        slug: 'imperial-velvet-bandhgala',
        categorySlug: 'bandhgalas-jackets',
        basePrice: 18999.0,
        compareAtPrice: 24999.0,
        description:
          'A tribute to timeless aristocratic tailoring. Luxurious warm-black micro-velvet adorned with antique brushed gold hand-cast metal buttons and silk satin lining.',
        featured: true,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=1200&q=85',
            altText: 'Imperial Velvet Bandhgala Front',
            isPrimary: true,
            sortOrder: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85',
            altText: 'Imperial Velvet Bandhgala Detail Shot',
            isPrimary: false,
            sortOrder: 1,
          },
        ],
        variants: [
          { sku: 'ITH-IVB-BLK-38', size: '38', color: 'Warm Black', price: 18999.0, stock: 6 },
          { sku: 'ITH-IVB-BLK-40', size: '40', color: 'Warm Black', price: 18999.0, stock: 10 },
          { sku: 'ITH-IVB-BLK-42', size: '42', color: 'Warm Black', price: 18999.0, stock: 7 },
          { sku: 'ITH-IVB-BLK-44', size: '44', color: 'Warm Black', price: 18999.0, stock: 4 },
        ],
      },
      {
        name: 'Zari Bordered Silk Dhoti',
        slug: 'zari-bordered-silk-dhoti',
        categorySlug: 'dhoti-bottoms',
        basePrice: 4999.0,
        compareAtPrice: 6499.0,
        description:
          'Pure Mulberry silk dhoti with an authentic 3-inch brushed gold zari temple border. Pre-pleated with concealed tailoring for effortless elegance.',
        featured: false,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
            altText: 'Zari Bordered Silk Dhoti',
            isPrimary: true,
            sortOrder: 0,
          },
        ],
        variants: [
          { sku: 'ITH-ZSD-PCH-FREE', size: 'Free Size', color: 'Parchment Ivory', price: 4999.0, stock: 25 },
        ],
      },
      {
        name: 'Kashmiri Antique Pashmina Stole',
        slug: 'kashmiri-antique-pashmina-stole',
        categorySlug: 'royal-shawls-stoles',
        basePrice: 14500.0,
        compareAtPrice: 17999.0,
        description:
          '100% GI-tagged Changthangi Pashmina wool, spun and woven entirely by hand in Srinagar. Featherlight warmth with heritage Sozni embroidery.',
        featured: true,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=85',
            altText: 'Kashmiri Antique Pashmina Stole',
            isPrimary: true,
            sortOrder: 0,
          },
        ],
        variants: [
          { sku: 'ITH-KPS-GLD-STD', size: 'Standard (2m x 1m)', color: 'Muted Gold & Ink', price: 14500.0, stock: 15 },
        ],
      },
    ];

    for (const p of productsData) {
      const category = categoryMap.get(p.categorySlug);
      if (!category) continue;

      let product = await Product.findOne({ where: { slug: p.slug } });
      if (!product) {
        product = await Product.create({
          name: p.name,
          slug: p.slug,
          description: p.description,
          category_id: category.id,
          base_price: p.basePrice,
          compare_at_price: p.compareAtPrice,
          featured: p.featured,
          status: 'ACTIVE',
        });

        for (const img of p.images) {
          await ProductImage.create({
            product_id: product.id,
            url: img.url,
            alt_text: img.altText,
            sort_order: img.sortOrder,
            is_primary: img.isPrimary,
          });
        }

        for (const v of p.variants) {
          const variant = await ProductVariant.create({
            product_id: product.id,
            sku: v.sku,
            size: v.size,
            color: v.color,
            price: v.price,
            status: 'ACTIVE',
          });

          await Inventory.create({
            variant_id: variant.id,
            on_hand: v.stock,
            reserved: 0,
            available: v.stock,
          });

          await InventoryMovement.create({
            variant_id: variant.id,
            quantity: v.stock,
            type: 'RESTOCK',
            actor: 'SEEDER',
            reason: 'Initial seed stock',
          });
        }
      }
    }

    // 5. Seed Coupons
    await Coupon.findOrCreate({
      where: { code: 'LEGACY10' },
      defaults: {
        code: 'LEGACY10',
        description: '10% off on your first heritage luxury order',
        type: 'PERCENTAGE',
        value: 10.0,
        min_order_value: 2999.0,
        max_discount: 2000.0,
        per_user_limit: 1,
        status: 'ACTIVE',
      },
    });

    await Coupon.findOrCreate({
      where: { code: 'ROYAL500' },
      defaults: {
        code: 'ROYAL500',
        description: 'Flat ₹500 discount on orders above ₹4,999',
        type: 'FIXED',
        value: 500.0,
        min_order_value: 4999.0,
        per_user_limit: 2,
        status: 'ACTIVE',
      },
    });

    logger.info('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, '❌ Database seeding failed');
    process.exit(1);
  }
}

seed();
