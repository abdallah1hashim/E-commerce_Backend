import { Request, Response, NextFunction } from "express";
import CategoryModel from "../../Models/Category";
import CategoryService from "../../services/CategoryService";
import HTTPError from "../../libs/HTTPError";

export const getCategores = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { isnested, parent } = req.query;
    // Fetch all categories
    const categories = (await CategoryModel.findAll()) as CategoryModel[];
    // Generate nested category structure
    if (isnested === "true") {
      const nestedCategories = CategoryService.buildCategoryTree(categories);
      res.status(200).json({ categories: nestedCategories });
      return;
    }
    // Filter categories by parent
    if (parent == "0") {
      const categoriesWithoutParent = categories.filter(
        (category) => category.parentId !== null
      );
      res.status(200).json({ categories: categoriesWithoutParent });
      return;
    }

    // Send response
    res.status(200).json({ categories: categories });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, parentId } = req.body;
    const category = await CategoryService.createCategory({
      name,
      parentId,
    });
    res
      .status(200)
      .json({ message: "Category created successfully", data: category });
  } catch (error: any) {
    HTTPError.handleControllerError(error, next);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { name, parentId } = req.body;
    const category = await CategoryModel.update({
      id,
      name,
      parentId,
    });
    res
      .status(200)
      .json({ message: "Category updated successfully", data: category });
  } catch (error: any) {
    HTTPError.handleControllerError(error, next);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const category = await CategoryModel.destroy({ where: { id } });
    res
      .status(200)
      .json({ message: "Category deleted successfully", data: category });
  } catch (error: any) {
    HTTPError.handleControllerError(error, next);
  }
};
