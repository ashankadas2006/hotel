# StayEasy – Hotel Booking (Next.js 15 + Prisma/SQLite + Tailwind)

Requires Node.js 18.18+ (20+ recommended).

    npm install
    npm run setup      # creates SQLite DB + demo data
    npm run dev        # open http://localhost:3000

Demo logins: owner@demo.com / demo123 (Owner), guest@demo.com / demo123 (Customer)
Mock payment: any 16-digit card number not starting with 0.
Run `npm run setup` only once (re-seeding would hit duplicate emails; delete prisma/dev.db to reset).
