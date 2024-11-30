import CategoryModel, { Category, NestedCategory } from "../Models/Category";

export default class CategoryService {
  static async createCategory(data: {
    name: string;
    parentId?: number | null;
  }): Promise<Category> {
    const category = new CategoryModel(null, data.name, data.parentId || null);
    return category.create();
  }
  static buildCategoryTree = (
    categories: Category[],
    parentId: number | null = null
  ): NestedCategory[] => {
    return categories
      .filter((category) => category.parentId === parentId)
      .map((category) => ({
        ...category,
        children: CategoryService.buildCategoryTree(categories, category.id),
      })) as NestedCategory[];
  };
}
