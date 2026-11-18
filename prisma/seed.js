const { PrismaClient } = require("@prisma/client"); const bcrypt = require("bcryptjs"); const db = new PrismaClient();
(async () => {
  const pw = await bcrypt.hash("demo123", 10);
  const o = await db.user.create({ data: { name: "Owner", email: "owner@demo.com", password: pw, role: "OWNER" } });
  await db.user.create({ data: { name: "Guest", email: "guest@demo.com", password: pw } });
  for (const [name, city] of [["Sea Breeze", "Goa"], ["Hill Crest", "Darjeeling"], ["Lake View", "Kolkata"]])
    await db.hotel.create({ data: { name, city, description: "Comfortable stay with great service.", ownerId: o.id,
      rooms: { create: [
        { name: "101", type: "Single", price: 1800, ac: false, capacity: 1 },
        { name: "201", type: "Double", price: 3200, ac: true, capacity: 2 },
        { name: "202", type: "Deluxe", price: 4800, ac: true, capacity: 3 },
        { name: "301", type: "Suite", price: 7500, ac: true, capacity: 4 }] } } });
  console.log("seeded");
})();
