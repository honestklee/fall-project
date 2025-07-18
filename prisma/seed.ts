// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 🔐 Hash password super admin
  const superAdminPass = await bcrypt.hash("OnePiece1999", 10);

  // ✅ Create or update super admin user
  await prisma.user.upsert({
    where: { email: "Luffy@gmail.com" },
    update: {
      password: superAdminPass,
      role: Role.SUPER_ADMIN,
    },
    create: {
      email: "Luffy@gmail.com",
      password: superAdminPass,
      role: Role.SUPER_ADMIN,
    },
  });

  console.log("✅ Akun super admin berhasil dibuat/diupdate!");
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
