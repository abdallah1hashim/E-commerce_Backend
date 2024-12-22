import Product from "../Models/Product";
import ProductImages from "../Models/ProductImages";
import pool from "../libs/ds";
import HTTPError from "../libs/HTTPError";
import { ProductDetailsPostData } from "../types/types";
import ProductDetails from "../Models/ProductDetails";

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
    price: number,
    stock: number,
    overview_img_url: string,
    category_id: number,
    images_url: string[],
    product_details: ProductDetailsPostData[]
  ) {
    const client = await pool.connect();
    try {
      const product = new Product(
        undefined,
        name,
        description,
        price,
        stock,
        overview_img_url,
        category_id
      );
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
            undefined,
            createdProduct.id
          );
          const res = await productDetail.create({
            product_id: createdProduct.id as number,
          });
          if (res === null) {
            throw new HTTPError(400, "Error creating product details");
          }
          createdProductDetails.push(res);
          return;
        })
      );
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
  static async updateOverViewImage(
    id: number,
    overview_img_url: string | null
  ): Promise<Product> {
    try {
      const product = new Product(
        id,
        undefined,
        undefined,
        undefined,
        undefined,
        overview_img_url
      );
      return (await product.updateOverView()) as Product;
    } catch (error) {
      throw HTTPError.handleServiceError(error);
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
