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
} from '../../database/index.js';
import { NotFoundError, ConflictError } from '../../common/errors/index.js';

export class ProductService {
  public async getProducts(filters: any) {
    const {
      category,
      categorySlug,
      featured,
      minPrice,
      maxPrice,
      size,
      search,
      sort,
      page = 1,
      limit = 20,
    } = filters;

    const where: any = { status: 'ACTIVE' };

    if (featured !== undefined) {
      where.featured = featured;
    }

    if (category) {
      where.category_id = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.base_price = {};
      if (minPrice !== undefined) where.base_price[Op.gte] = minPrice;
      if (maxPrice !== undefined) where.base_price[Op.lte] = maxPrice;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
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

    let orderClause: SeqOrder = [['created_at', 'DESC']];
    if (sort === 'price_asc') orderClause = [['base_price', 'ASC']];
    if (sort === 'price_desc') orderClause = [['base_price', 'DESC']];
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
          where: variantWhere,
          required: Boolean(size),
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
    if (product) {
      await product.destroy();
      return { success: true, message: 'Product deleted successfully' };
    }
    return { success: true, message: 'Product removed' };
  }
}

export const productService = new ProductService();
