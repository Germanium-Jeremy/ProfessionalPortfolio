import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Site Admin',
    },
  });

  console.log(`Admin user seeded: ${admin.email}`);
  
  // Seed initial profile
  const profileCount = await prisma.profile.count();
  if (profileCount === 0) {
    await prisma.profile.create({
      data: {
        fullName: 'John Doe',
        headline: 'Full-Stack Developer',
        bio: 'Welcome to my portfolio. This was seeded automatically.',
      },
    });
    console.log('Default profile seeded.');
  }

  // Seed site setting
  const settingCount = await prisma.siteSetting.count();
  if (settingCount === 0) {
    await prisma.siteSetting.create({
      data: {
        key: 'accent',
        value: JSON.stringify({ color: '#3b82f6' }), // Blue default
      }
    });
    console.log('Default site settings seeded.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
