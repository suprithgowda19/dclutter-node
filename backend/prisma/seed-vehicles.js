import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/config/db.js";

async function seedVehicles() {
  console.log("🌱 Seeding Vehicles and Driver User accounts...");

  const constituencies = await prisma.constituency.findMany({ take: 2 });
  const constituencyIds = constituencies.map((c) => c.id);

  const sampleVehicles = [
    {
      vehicleNumber: "KA-01-EA-1024",
      normalizedNumber: "KA01EA1024",
      vehicleType: "Compactor Truck",
      capacityTons: 3.5,
      driverName: "Ramesh Kumar",
      driverPhone: "9845012345",
      driverEmail: "ramesh.driver@dclutter.gov.in",
      licenseNumber: "KA0120190001234",
      constituencyIds,
      status: true,
    },
    {
      vehicleNumber: "KA-04-MB-4589",
      normalizedNumber: "KA04MB4589",
      vehicleType: "Tipper (Mini Truck)",
      capacityTons: 1.5,
      driverName: "Manjunath S",
      driverPhone: "9845067890",
      driverEmail: "manjunath.driver@dclutter.gov.in",
      licenseNumber: "KA0420200005678",
      constituencyIds,
      status: true,
    },
  ];

  for (const v of sampleVehicles) {
    const existing = await prisma.vehicle.findUnique({
      where: { normalizedNumber: v.normalizedNumber },
    });

    if (!existing) {
      // 1. Create Driver User in `users` table
      let user = await prisma.user.findFirst({
        where: { phone: v.driverPhone },
      });

      if (!user) {
        const hashedPassword = await bcrypt.hash("1234", 10);
        user = await prisma.user.create({
          data: {
            name: v.driverName,
            phone: v.driverPhone,
            email: v.driverEmail,
            password: hashedPassword,
            role: "VEHICLE",
            constituencyIds: v.constituencyIds,
          },
        });
        console.log(` Created driver user: ${v.driverName} (${v.driverPhone})`);
      }

      // 2. Create Vehicle
      const { driverEmail, ...vehicleData } = v;
      vehicleData.userId = user.id;

      await prisma.vehicle.create({ data: vehicleData });
      console.log(` Created vehicle: ${v.vehicleNumber} [${v.vehicleType}]`);
    } else {
      console.log(` Vehicle already exists: ${v.vehicleNumber}`);
    }
  }

  console.log("✅ Vehicles seeded successfully.");
}

seedVehicles()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
