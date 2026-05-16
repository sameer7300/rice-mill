const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPw = await bcrypt.hash('admin123', 10);
  const userPw = await bcrypt.hash('password123', 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ricemill.pk' },
    update: {},
    create: { name: 'Muhammad Ali (Owner)', email: 'admin@ricemill.pk', password: adminPw, role: 'admin', phone: '+92-300-1234567' }
  });

  // Staff
  await prisma.user.upsert({
    where: { email: 'staff@ricemill.pk' },
    update: {},
    create: { name: 'Ahmed Khan', email: 'staff@ricemill.pk', password: userPw, role: 'staff', phone: '+92-333-7654321' }
  });

  // Supplier
  const supplierUser = await prisma.user.upsert({
    where: { email: 'farmer@example.pk' },
    update: {},
    create: { name: 'Ghulam Hussain', email: 'farmer@example.pk', password: userPw, role: 'supplier', phone: '+92-321-9876543' }
  });
  await prisma.supplier.upsert({
    where: { userId: supplierUser.id },
    update: {},
    create: { userId: supplierUser.id, businessName: 'Hussain Farms', address: 'Gujranwala, Punjab', contactPerson: 'Ghulam Hussain', phone: '+92-321-9876543' }
  });

  // Customer
  const customerUser = await prisma.user.upsert({
    where: { email: 'buyer@example.pk' },
    update: {},
    create: { name: 'Tariq Mehmood', email: 'buyer@example.pk', password: userPw, role: 'customer', phone: '+92-302-5551234' }
  });
  await prisma.customer.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: { userId: customerUser.id, businessName: 'Mehmood Traders', address: 'Lahore, Punjab', contactPerson: 'Tariq Mehmood', phone: '+92-302-5551234', creditLimit: 500000 }
  });

  console.log('✓ Users created');
  console.log('\nLogin credentials:');
  console.log('  Admin   → admin@ricemill.pk / admin123');
  console.log('  Staff   → staff@ricemill.pk / password123');
  console.log('  Supplier→ farmer@example.pk / password123');
  console.log('  Customer→ buyer@example.pk  / password123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
