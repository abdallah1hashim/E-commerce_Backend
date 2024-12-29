import Product from "../Models/Product";
import ProductImages from "../Models/ProductImages";
import pool from "../libs/db";
import HTTPError from "../libs/HTTPError";
import { ProductDetailsPostData } from "../types/types";
import ProductDetails from "../Models/ProductDetails";
import GroupToProduct from "../Models/GroupToProduct";

type ProductWithImages = Product & { images: ProductImages[] };

export default class ProductService {
  static async findById(id: number): Promise<Product> {
    const client = await pool.connect();
    try {
      const product = new Product(id);
      return (await product.getById(client)) as Product;
    } catch (error) {
      throw HTTPError.handleServiceError(error);
    } finally {
      client.release();
    }
  }
  static async getProductByIdWithImages(
    id: number
  ): Promise<ProductWithImages | void> {
    const client = await pool.connect();
    try {
      const product = new Product(id);
      const retrievedProduct = await product.getById(client);
      const productImages = new ProductImages(undefined, undefined, id);
      const retrievedimages = (await productImages.findByProductId(
        client
      )) as ProductImages[];
      return { ...retrievedProduct, images: retrievedimages };
    } catch (error) {
      HTTPError.handleServiceError(error);
    } finally {
      client.release();
    }
  }
  static async createProduct(
    name: string,
    description: string,
    category_id: number,
    group_id: number | undefined,
    images_url: string[],
    product_details: ProductDetailsPostData[]
  ) {
    const client = await pool.connect();
    try {
      const product = new Product(undefined, name, description, category_id);
      await client.query("BEGIN");
      const createdProduct = (await product.create(client)) as Product;
      const retrievedimages = await Promise.all(
        images_url.map(async (image) => {
          const Image = new ProductImages(undefined, image, createdProduct.id);
          return await Image.create(client);
        })
      );
      if (
        createdProduct === null ||
        retrievedimages === null ||
        retrievedimages.length === 0
      ) {
        throw new HTTPError(400, "Error creating product");
      }
      const createdProductDetails = [] as ProductDetails[];
      await Promise.all(
        product_details.map(async (detail) => {
          const productDetail = new ProductDetails(
            undefined,
            detail.size,
            detail.color,
            detail.stock,
            detail.price,
            detail.discount,
            detail.img_preview,
            createdProduct.id
          );
          const res = await productDetail.create(client);
          if (res === null) {
            throw new HTTPError(400, "Error creating product details");
          }
          createdProductDetails.push(res);
          return;
        })
      );
      if (group_id !== undefined) {
        await GroupToProduct.addRelation(
          client,
          group_id,
          createdProduct.id as number
        );
      }
      await client.query("COMMIT");
      return {
        ...createdProduct,
        product_details: createdProductDetails,
        images: retrievedimages,
      };
    } catch (error) {
      client.query("ROLLBACK");
      return HTTPError.handleServiceError(error);
    } finally {
      client.release();
    }
  }

  static async createProductImage(Productid: number, image_url: string[]) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const retrievedimages = await Promise.all(
        image_url.map(async (image) => {
          const Image = new ProductImages(undefined, image, Productid);
          return await Image.create(client);
        })
      );
      await client.query("COMMIT");
      return retrievedimages;
    } catch (error) {
      client.query("ROLLBACK");
      return HTTPError.handleServiceError(error);
    } finally {
      client.release();
    }
  }
}
