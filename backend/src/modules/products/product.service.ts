import { Op, Order as SeqOrder } from 'sequelize';
import {
  sequelize,
  Product,
  ProductVariant,
  ProductImage,
  Category,
  Inventory,
  InventoryMovement,
  Review,
  WishlistItem,
  CartItem,
} from '../../database/index.js';
import {
  NotFoundError,
  ConflictError,
  BusinessRuleError,
} from '../../common/errors/index.js';
import { cleanupMultipleUploadedFiles } from '../../common/utils/file-cleanup.js';

export class ProductService {
  public async getProducts(filters: any) {
    const {
      category,
      categorySlug,
      featured,
      minPrice,
      maxPrice,
      price_min,
      price_max,
      size,
      color,
      search,
      sort,
      page = 1,
      limit = 20,
    } = filters;

    const where: any = { status: 'ACTIVE' };

    if (featured !== undefined) {
      where.featured = featured === true || featured === 'true';
    }

    if (category) {
      where.category_id = category;
    }

    const effectiveMinPrice = minPrice !== undefined ? minPrice : price_min;
    const effectiveMaxPrice = maxPrice !== undefined ? maxPrice : price_max;

    if (effectiveMinPrice !== undefined || effectiveMaxPrice !== undefined) {
      where.base_price = {};
      if (effectiveMinPrice !== undefined) where.base_price[Op.gte] = Number(effectiveMinPrice);
      if (effectiveMaxPrice !== undefined) where.base_price[Op.lte] = Number(effectiveMaxPrice);
    }

    // Full-Text & Multi-Token Fuzzy Search Matching
    if (search && typeof search === 'string') {
      const cleanSearch = search.trim();
      const tokens = cleanSearch
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length > 0);

      // Expand synonym tokens (e.g. "tee" -> "shirt" / "t-shirt")
      const expandedTokens: string[] = [];
      tokens.forEach((tok) => {
        expandedTokens.push(tok);
        if (tok === 'tee' || tok === 'tshirt' || tok === 't-shirt') {
          expandedTokens.push('shirt', 'kurta', 'top', 'apparel');
        }
        if (tok.endsWith('s') && tok.length > 3) {
          expandedTokens.push(tok.slice(0, -1));
        }
      });

      const uniqueTokens = Array.from(new Set(expandedTokens));

      const tokenConditions = uniqueTokens.map((tok) => ({
        [Op.or]: [
          { name: { [Op.iLike]: `%${tok}%` } },
          { description: { [Op.iLike]: `%${tok}%` } },
          { fabric_composition: { [Op.iLike]: `%${tok}%` } },
          { care_instructions: { [Op.iLike]: `%${tok}%` } },
        ],
      }));

      where[Op.or] = [
        { name: { [Op.iLike]: `%${cleanSearch}%` } },
        { description: { [Op.iLike]: `%${cleanSearch}%` } },
        ...tokenConditions,
      ];
    }

    const categoryInclude: any = {
      model: Category,
      as: 'category',
      attributes: ['id', 'name', 'slug'],
    };

    if (categorySlug) {
      categoryInclude.where = { slug: categorySlug };
      categoryInclude.required = true;
    }

    const variantWhere: any = { status: 'ACTIVE' };
    if (size) {
      variantWhere.size = size;
    }
    if (color) {
      variantWhere.color = { [Op.iLike]: `%${color}%` };
    }

    let orderClause: SeqOrder = [['created_at', 'DESC']];
    if (sort === 'price_asc') orderClause = [['base_price', 'ASC']];
    if (sort === 'price_desc') orderClause = [['base_price', 'DESC']];
    if (sort === 'newest') orderClause = [['created_at', 'DESC']];
    if (sort === 'rating' || sort === 'popularity') orderClause = [['rating', 'DESC'], ['created_at', 'DESC']];
    if (sort === 'featured') orderClause = [['featured', 'DESC'], ['created_at', 'DESC']];

    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        categoryInclude,
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'url', 'alt_text', 'sort_order', 'is_primary'],
        },
        {
          model: ProductVariant,
          as: 'variants',
          where: Object.keys(variantWhere).length > 1 ? variantWhere : undefined,
          required: Boolean(size || color),
          include: [
            {
              model: Inventory,
              as: 'inventory',
              attributes: ['available'],
              required: false,
            },
          ],
        },
      ],
      order: orderClause,
      limit,
      offset,
      distinct: true,
      subQuery: false,
    });

    return {
      products,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  public async getProductBySlug(slug: string) {
    const product = await Product.findOne({
      where: { slug, status: 'ACTIVE' },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'url', 'alt_text', 'sort_order', 'is_primary', 'variant_id'],
        },
        {
          model: ProductVariant,
          as: 'variants',
          where: { status: 'ACTIVE' },
          include: [
            {
              model: Inventory,
              as: 'inventory',
              attributes: ['available', 'on_hand'],
            },
          ],
        },
        {
          model: Review,
          as: 'reviews',
          where: { status: 'APPROVED' },
          required: false,
        },
      ],
      order: [
        [{ model: ProductImage, as: 'images' }, 'sort_order', 'ASC'],
        [{ model: ProductVariant, as: 'variants' }, 'price', 'ASC'],
      ],
    });

    if (!product) throw new NotFoundError('Product');
    return product;
  }

  public async createProduct(data: any, actorId?: string) {
    const existing = await Product.findOne({ where: { slug: data.slug } });
    if (existing) throw new ConflictError(`Product with slug '${data.slug}' already exists`);

    return sequelize.transaction(async (t) => {
      const product = await Product.create(
        {
          name: data.name,
          slug: data.slug,
          description: data.description,
          short_description: data.shortDescription || null,
          category_id: data.categoryId,
          base_price: data.basePrice,
          compare_at_price: data.compareAtPrice || null,
          featured: data.featured || false,
          metadata: data.metadata || null,
          status: 'ACTIVE',
        },
        { transaction: t }
      );

      if (data.images && data.images.length > 0) {
        await ProductImage.bulkCreate(
          data.images.map((img: any) => ({
            product_id: product.id,
            url: img.url,
            alt_text: img.altText || product.name,
            sort_order: img.sortOrder || 0,
            is_primary: img.isPrimary || false,
          })),
          { transaction: t }
        );
      }

      if (data.variants && data.variants.length > 0) {
        for (const v of data.variants) {
          const variant = await ProductVariant.create(
            {
              product_id: product.id,
              sku: v.sku.toUpperCase(),
              size: v.size,
              color: v.color || null,
              price: v.price,
              compare_at_price: v.compareAtPrice || null,
              barcode: v.barcode || null,
              status: 'ACTIVE',
            },
            { transaction: t }
          );

          const initialStock = v.initialStock || 0;
          await Inventory.create(
            {
              variant_id: variant.id,
              on_hand: initialStock,
              reserved: 0,
              available: initialStock,
            },
            { transaction: t }
          );

          if (initialStock > 0) {
            await InventoryMovement.create(
              {
                variant_id: variant.id,
                quantity: initialStock,
                type: 'RESTOCK',
                actor: actorId || 'ADMIN',
                reason: 'Initial stock on product creation',
              },
              { transaction: t }
            );
          }
        }
      }

      return this.getProductBySlug(product.slug);
    });
  }

  public async deleteProduct(id: string) {
    let product = await Product.findByPk(id);
    if (!product) {
      product = await Product.findOne({ where: { slug: id } });
    }
    if (!product) {
      return { success: true, message: 'Product not found or already deleted' };
    }

    const t = await sequelize.transaction();
    try {
      // Collect all image URLs for disk cleanup
      const images = await ProductImage.findAll({ where: { product_id: product.id }, transaction: t });
      const imageUrls: string[] = images.map((img) => img.url);

      if (product.metadata && typeof product.metadata === 'object' && Array.isArray((product.metadata as any).colorSwatches)) {
        (product.metadata as any).colorSwatches.forEach((swatch: any) => {
          if (Array.isArray(swatch.images)) {
            imageUrls.push(...swatch.images);
          }
        });
      }

      const variants = await ProductVariant.findAll({ where: { product_id: product.id }, transaction: t });
      const variantIds = variants.map((v) => v.id);

      if (variantIds.length > 0) {
        await CartItem.destroy({ where: { variant_id: { [Op.in]: variantIds } }, transaction: t });
        await Inventory.destroy({ where: { variant_id: { [Op.in]: variantIds } }, transaction: t });
        await InventoryMovement.destroy({ where: { variant_id: { [Op.in]: variantIds } }, transaction: t });
        await ProductVariant.destroy({ where: { product_id: product.id }, transaction: t });
      }

      await ProductImage.destroy({ where: { product_id: product.id }, transaction: t });
      await Review.destroy({ where: { product_id: product.id }, transaction: t });
      await WishlistItem.destroy({ where: { product_id: product.id }, transaction: t });

      await product.destroy({ transaction: t });
      await t.commit();

      // Delete files from disk in uploads folder
      cleanupMultipleUploadedFiles(imageUrls);

      return { success: true, message: 'Product deleted permanently and uploaded images cleaned' };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}

export const productService = new ProductService();
