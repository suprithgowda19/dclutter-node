import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categoriesData = [
  {
    name: "Furniture",
    icon: "fa-couch",
    subcategories: [
      { name: "Cots", icon: "fa-bed" },
      { name: "Sofas", icon: "fa-couch" },
      { name: "Chairs", icon: "fa-chair" },
      { name: "Tables", icon: "fa-table" },
      { name: "Cupboards", icon: "fa-door-closed" },
      { name: "Other Furniture", icon: "fa-layer-group" },
    ],
  },
  {
    name: "Mattresses & Cushions",
    icon: "fa-bed",
    subcategories: [
      { name: "Single Mattress", icon: "fa-bed" },
      { name: "Double Mattress", icon: "fa-bed" },
      { name: "Pillows", icon: "fa-cloud" },
      { name: "Cushions", icon: "fa-cube" },
    ],
  },
  {
    name: "Clothes & Shoes",
    icon: "fa-shirt",
    subcategories: [
      { name: "Men's Clothing", icon: "fa-user-tie" },
      { name: "Women's Clothing", icon: "fa-person-dress" },
      { name: "Kids Clothing", icon: "fa-child" },
      { name: "Shoes", icon: "fa-shoe-prints" },
      { name: "Bags", icon: "fa-bag-shopping" },
    ],
  },
  {
    name: "Household appliances",
    icon: "fa-plug-circle-bolt",
    subcategories: [
      { name: "Refrigerator", icon: "fa-snowflake" },
      { name: "Washing Machine", icon: "fa-soap" },
      { name: "Microwave", icon: "fa-fire-burner" },
      { name: "Mixer Grinder", icon: "fa-blender" },
      { name: "TV", icon: "fa-tv" },
      { name: "Other Appliances", icon: "fa-plug" },
    ],
  },
  {
    name: "Electronics",
    icon: "fa-laptop",
    subcategories: [
      { name: "Laptops/Computers", icon: "fa-laptop" },
      { name: "Mobile Phones", icon: "fa-mobile-screen" },
      { name: "Printers", icon: "fa-print" },
      { name: "Cables/Chargers", icon: "fa-plug" },
      { name: "Other Electronics", icon: "fa-microchip" },
    ],
  },
  {
    name: "Books & Magazines",
    icon: "fa-book-open",
    subcategories: [
      { name: "School Books", icon: "fa-book" },
      { name: "Novels", icon: "fa-book-open" },
      { name: "Magazines", icon: "fa-newspaper" },
      { name: "Newspapers", icon: "fa-file-lines" },
    ],
  },
  {
    name: "Toys & Games",
    icon: "fa-puzzle-piece",
    subcategories: [
      { name: "Soft Toys", icon: "fa-paw" },
      { name: "Board Games", icon: "fa-chess-board" },
      { name: "Electronic Toys", icon: "fa-gamepad" },
      { name: "Bicycles", icon: "fa-bicycle" },
    ],
  },
  {
    name: "Other Items",
    icon: "fa-box-open",
    subcategories: [
      { name: "Utensils", icon: "fa-utensils" },
      { name: "Plastic Items", icon: "fa-bottle-water" },
      { name: "Glassware", icon: "fa-wine-glass" },
      { name: "Miscellaneous", icon: "fa-box-open" },
    ],
  },
];

async function seedCategories() {
  console.log("🚀 Seeding Categories and Subcategories...");

  let totalCategories = 0;
  let totalSubcategories = 0;

  for (const catData of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: catData.name },
      update: {
        icon: catData.icon,
        status: true,
      },
      create: {
        name: catData.name,
        icon: catData.icon,
        status: true,
      },
    });

    totalCategories++;

    for (const subcatData of catData.subcategories) {
      const existingSub = await prisma.subcategory.findFirst({
        where: {
          categoryId: category.id,
          name: subcatData.name,
        },
      });

      if (existingSub) {
        await prisma.subcategory.update({
          where: { id: existingSub.id },
          data: {
            icon: subcatData.icon,
            status: true,
          },
        });
      } else {
        await prisma.subcategory.create({
          data: {
            categoryId: category.id,
            name: subcatData.name,
            icon: subcatData.icon,
            status: true,
          },
        });
      }

      totalSubcategories++;
    }
  }

  console.log(`✅ Successfully seeded ${totalCategories} Categories and ${totalSubcategories} Subcategories!`);
}

seedCategories()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
