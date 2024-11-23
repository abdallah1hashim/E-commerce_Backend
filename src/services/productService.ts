import Product from "../Models/Product";
import ProductImages from "../Models/ProductImages";
import pool from "../utils/ds";
import HTTPError from "../utils/HTTPError";

type ProductWithImages = Product & { images: ProductImages[] };

export default class ProductService {
  static async getProductByIdWithImages(
    id: number
  ): Promise<ProductWithImages | void> {
    const client = await pool.connect();
    try {
      const product = new Product(id);
      const retrievedProduct = await product.getById(client);
      const productImages = new ProductImages(undefined, undefined, id);
      const retrievedimages = (await productImages.getByProductId(
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
    images_url: string[]
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
      await client.query("COMMIT");
      return { ...createdProduct, images: retrievedimages };
    } catch (error) {
      client.query("ROLLBACK");
      return HTTPError.handleServiceError(error);
    } finally {
      client.release();
    }
  }
}
