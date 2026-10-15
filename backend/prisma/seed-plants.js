import prisma from "../src/config/db.js";

async function seedPlants() {
  console.log("🌱 Seeding BBMP Waste Processing Plants...");

  // Find a corporation and constituency
  const corporation = await prisma.corporation.findFirst();
  if (!corporation) {
    console.error("No corporation found. Run geo seed first.");
    process.exit(1);
  }

  const constituencies = await prisma.constituency.findMany({
    where: { corporationId: corporation.id },
    take: 4,
  });

  const samplePlants = [
    {
      name: "Seegehalli Solid Waste Processing Plant",
      corporationId: corporation.id,
      constituencyId: constituencies[0]?.id || 1,
      address: "Seegehalli, Magadi Main Road, Bengaluru, Karnataka 560091",
      latitude: 12.9784,
      longitude: 77.4812,
      status: true,
    },
    {
      name: "Kannahalli Waste to Energy Processing Unit",
      corporationId: corporation.id,
      constituencyId: constituencies[1]?.id || constituencies[0]?.id || 1,
      address: "Kannahalli Village, Tavarekere Hobli, Bengaluru 562130",
      latitude: 12.9512,
      longitude: 77.4419,
      status: true,
    },
    {
      name: "Doddabidarakallu MSW Processing Facility",
      corporationId: corporation.id,
      constituencyId: constituencies[2]?.id || constituencies[0]?.id || 1,
      address: "Doddabidarakallu, Nagasandra Post, Tumkur Road, Bengaluru 560073",
      latitude: 13.0456,
      longitude: 77.5023,
      status: true,
    },
    {
      name: "Subbarayanakere Biomethanation & Material Recovery Facility",
      corporationId: corporation.id,
      constituencyId: constituencies[3]?.id || constituencies[0]?.id || 1,
      address: "Subbarayanakere, Chamrajpet, Bengaluru 560018",
      latitude: 12.9575,
      longitude: 77.5684,
      status: true,
    },
  ];

  for (const plantData of samplePlants) {
    const existing = await prisma.plant.findFirst({
      where: { name: plantData.name },
    });

    if (!existing) {
      await prisma.plant.create({ data: plantData });
      console.log(` Created plant: ${plantData.name}`);
    } else {
      console.log(` Plant already exists: ${plantData.name}`);
    }
  }

  console.log("✅ Plants seeded successfully.");
}

seedPlants()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
