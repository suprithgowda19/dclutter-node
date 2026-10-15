import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../");

const prisma = new PrismaClient();

// Tokenizes a single SQL VALUES tuple like: (1, 'Name', NULL, '{"json":"val"}')
function parseSqlTuple(tupleStr) {
  // Trim outer ( and ), and possible trailing comma or semicolon
  let str = tupleStr.trim();
  if (str.startsWith("(")) str = str.slice(1);
  if (str.endsWith(");") || str.endsWith("),")) str = str.slice(0, -2);
  else if (str.endsWith(")")) str = str.slice(0, -1);

  const tokens = [];
  let current = "";
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (escapeNext) {
      current += char;
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      escapeNext = true;
      continue;
    }

    if (char === "'") {
      if (inString && i + 1 < str.length && str[i + 1] === "'") {
        // Escaped single quote ''
        current += "'";
        i++;
        continue;
      }
      inString = !inString;
      continue;
    }

    if (char === "," && !inString) {
      tokens.push(formatToken(current.trim()));
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0) {
    tokens.push(formatToken(current.trim()));
  }

  return tokens;
}

function formatToken(token) {
  if (token === "NULL" || token === "null" || token === "") return null;
  if (/^-?\d+$/.test(token)) return parseInt(token, 10);
  if (/^-?\d+\.\d+$/.test(token)) return parseFloat(token);
  return token;
}

async function seedCorporations() {
  const filePath = path.join(rootDir, "corporations (5).sql");
  console.log(`📖 Reading ${filePath}...`);
  const content = fs.readFileSync(filePath, "utf8");

  const lines = content.split("\n").filter((l) => l.trim().startsWith("("));
  console.log(`Found ${lines.length} corporations to import...`);

  for (const line of lines) {
    const tokens = parseSqlTuple(line);
    const [id, name, nameKn, boneMerchantId, meatMerchantId, createdAt, updatedAt] = tokens;

    await prisma.corporation.upsert({
      where: { id },
      update: {
        name,
        nameKn,
        boneMerchantId: boneMerchantId ? String(boneMerchantId) : null,
        meatMerchantId: meatMerchantId ? String(meatMerchantId) : null,
      },
      create: {
        id,
        name,
        nameKn,
        boneMerchantId: boneMerchantId ? String(boneMerchantId) : null,
        meatMerchantId: meatMerchantId ? String(meatMerchantId) : null,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
      },
    });
  }

  console.log("✅ Corporations imported successfully!");
}

async function seedConstituencies() {
  const filePath = path.join(rootDir, "constituencies (5).sql");
  console.log(`📖 Reading ${filePath}...`);
  const content = fs.readFileSync(filePath, "utf8");

  const lines = content.split("\n").filter((l) => l.trim().startsWith("("));
  console.log(`Found ${lines.length} constituencies to import...`);

  for (const line of lines) {
    const tokens = parseSqlTuple(line);
    const [id, corporationId, acNo, name, nameKn, createdAt, updatedAt] = tokens;

    await prisma.constituency.upsert({
      where: { id },
      update: {
        corporationId,
        acNo: acNo ? Number(acNo) : null,
        name,
        nameKn,
      },
      create: {
        id,
        corporationId,
        acNo: acNo ? Number(acNo) : null,
        name,
        nameKn,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
      },
    });
  }

  console.log("✅ Constituencies imported successfully!");
}

async function seedWards() {
  const filePath = path.join(rootDir, "wards (11).sql");
  console.log(`📖 Reading ${filePath}...`);
  const content = fs.readFileSync(filePath, "utf8");

  const lines = content.split("\n").filter((l) => l.trim().startsWith("("));
  console.log(`Found ${lines.length} wards to import...`);

  let imported = 0;
  for (const line of lines) {
    const tokens = parseSqlTuple(line);
    const [id, constituencyId, wardNumber, name, nameKn, _geom, boundry, createdAt, updatedAt] = tokens;

    // Check if constituency exists
    const constituencyExists = await prisma.constituency.findUnique({
      where: { id: constituencyId },
    });

    if (!constituencyExists) {
      console.warn(`⚠️ Skipping Ward ${name} (#${id}): Constituency ${constituencyId} does not exist.`);
      continue;
    }

    await prisma.ward.upsert({
      where: { id },
      update: {
        constituencyId,
        wardNumber: wardNumber ? Number(wardNumber) : null,
        name,
        nameKn,
        boundry: boundry || null,
      },
      create: {
        id,
        constituencyId,
        wardNumber: wardNumber ? Number(wardNumber) : null,
        name,
        nameKn,
        boundry: boundry || null,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
      },
    });

    imported++;
    if (imported % 50 === 0 || imported === lines.length) {
      console.log(`   Imported ${imported}/${lines.length} wards...`);
    }
  }

  console.log("✅ Wards imported successfully!");
}

async function resetSequences() {
  console.log("🔄 Resetting Postgres auto-increment sequences...");
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('corporations', 'id'), COALESCE(max(id), 1)) FROM corporations;`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('constituencies', 'id'), COALESCE(max(id), 1)) FROM constituencies;`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('wards', 'id'), COALESCE(max(id), 1)) FROM wards;`);
  console.log("✅ Sequences synced successfully!");
}

async function main() {
  try {
    console.log("🚀 Starting Geo Data Migration...");
    await seedCorporations();
    await seedConstituencies();
    await seedWards();
    await resetSequences();
    console.log("🎉 All Geo Data successfully seeded into PostgreSQL database!");
  } catch (error) {
    console.error("❌ Seeding failed with error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
