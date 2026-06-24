import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const users = [
    { name: 'Alice Silva',  email: 'alice@carteira.dev', balance: 1000 },
    { name: 'Bruno Costa',  email: 'bruno@carteira.dev', balance: 500  },
    { name: 'Carla Mendes', email: 'carla@carteira.dev', balance: 0    },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash('senha123', 10);
    await prisma.user.upsert({
      where:  { email: u.email },
      update: {},
      create: {
        name:     u.name,
        email:    u.email,
        password: hash,
        wallet: {
          create: { balance: u.balance },
        },
      },
    });
    console.log(`✓ ${u.name} (${u.email})`);
  }

  console.log('✅ Seed completo!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
