import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
const prisma = new PrismaClient();

async function main() {
  // Seeding Parent categories
  await prisma.category.createMany({
    data: [
      { name: "Women" },
      { name: "Men" },
      { name: "Kids" },
      { name: "Accessories" },
    ],
  });
  // Fetch the parent categories first
  const womenCategory = await prisma.category.findFirst({
    where: { name: "Women" },
  });
  const menCategory = await prisma.category.findFirst({
    where: { name: "Men" },
  });
  const kidsCategory = await prisma.category.findFirst({
    where: { name: "Kids" },
  });
  const accessoriesCategory = await prisma.category.findFirst({
    where: { name: "Accessories" },
  });

  // Create categories with parent_id after fetching
  await prisma.category.createMany({
    data: [
      { name: "Shoes", parent_id: womenCategory.id },
      { name: "Shirts", parent_id: menCategory.id },
      { name: "Jeans", parent_id: kidsCategory.id },
      { name: "Sunglasses", parent_id: accessoriesCategory.id },
    ],
  });

  // Seeding groups
  await prisma.group.createMany({
    data: [
      { name: "New Arrivals" },
      { name: "Best Sellers" },
      { name: "Summer Collection" },
    ],
  });

  const newArrivals = await prisma.group.findUnique({
    where: { name: "New Arrivals" },
  });
  const bestSellers = await prisma.group.findUnique({
    where: { name: "Best Sellers" },
  });
  const summerCollection = await prisma.group.findUnique({
    where: { name: "Summer Collection" },
  });

  // Seeding products
  const product1 = await prisma.product.create({
    data: {
      name: "Product 1",
      description: "Description 1",
      category_id: 1,
      group: {
        connect: [{ id: newArrivals.id }, { id: bestSellers.id }],
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "Product 2",
      description: "Description 2",
      category_id: 2,
      group: {
        connect: [{ id: summerCollection.id }],
      },
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: "Product 3",
      description: "Description 3",
      category_id: 3,
      group: {
        connect: [{ id: newArrivals.id }],
      },
    },
  });

  // seeding ProductDetails
  await prisma.productDetails.createMany({
    data: [
      {
        size: "S",
        color: "Red",
        stock: 10,
        price: 100,
        discount: 10,
        product_id: 1,
        img_preview: "https://example.com/image1.jpg",
      },
      {
        size: "M",
        color: "Blue",
        stock: 20,
        price: 200,
        discount: 20,
        product_id: 2,
        img_preview: "https://example.com/image2.jpg",
      },
      {
        size: "L",
        color: "Green",
        stock: 30,
        price: 300,
        discount: 30,
        product_id: 3,
        img_preview: "https://example.com/image3.jpg",
      },
    ],
  });

  // Seeding users
  const pass1 = await hash("1", 10);
  const pass2 = await hash("1", 10);

  await prisma.user.createMany({
    data: [
      {
        name: "John Doe",
        email: "admin@gg.com",
        password: pass1,
        role: "admin",
      },
      { name: "Jane Doe", email: "customer@google.com", password: pass2 },
    ],
  });

  console.log("Database has been seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
