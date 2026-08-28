import { Category, Product } from '../../database/index.js';
import { NotFoundError, ConflictError } from '../../common/errors/index.js';

export class CategoryService {
  public async getCategories(includeArchived = false) {
    return Category.findAll({
      where: includeArchived ? {} : { status: 'ACTIVE' },
      order: [
        ['sort_order', 'ASC'],
        ['name', 'ASC'],
      ],
      include: [
        {
          model: Category,
          as: 'subcategories',
          where: includeArchived ? {} : { status: 'ACTIVE' },
          required: false,
        },
      ],
    });
  }

  public async getCategoryBySlug(slug: string) {
    const category = await Category.findOne({
      where: { slug, status: 'ACTIVE' },
      include: [
        {
          model: Category,
          as: 'subcategories',
          where: { status: 'ACTIVE' },
          required: false,
        },
      ],
    });
    if (!category) throw new NotFoundError('Category');
    return category;
  }

  public async createCategory(data: any) {
    const existing = await Category.findOne({ where: { slug: data.slug } });
    if (existing) throw new ConflictError(`Category with slug '${data.slug}' already exists`);

    return Category.create({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      parent_id: data.parentId || null,
      image_url: data.imageUrl || null,
      sort_order: data.sortOrder || 0,
      status: data.status || 'ACTIVE',
    });
  }

  public async updateCategory(id: string, data: any) {
    const category = await Category.findByPk(id);
    if (!category) throw new NotFoundError('Category');

    if (data.slug && data.slug !== category.slug) {
      const existing = await Category.findOne({ where: { slug: data.slug } });
      if (existing) throw new ConflictError(`Category with slug '${data.slug}' already exists`);
      category.slug = data.slug;
    }

    if (data.name !== undefined) category.name = data.name;
    if (data.description !== undefined) category.description = data.description;
    if (data.parentId !== undefined) category.parent_id = data.parentId;
    if (data.imageUrl !== undefined) category.image_url = data.imageUrl;
    if (data.sortOrder !== undefined) category.sort_order = data.sortOrder;
    if (data.status !== undefined) category.status = data.status;

    await category.save();
    return category;
  }
}

export const categoryService = new CategoryService();
