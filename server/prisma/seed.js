const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPw  = await bcrypt.hash('admin123',    10);
  const userPw   = await bcrypt.hash('password123', 10);

  // ─── USERS ────────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@ricemill.pk' },
    update: {},
    create: { name: 'Muhammad Ali (Owner)', email: 'admin@ricemill.pk', password: adminPw, role: 'admin', phone: '+92-300-1234567', referralCode: 'RM-A1234' }
  });

  await prisma.user.upsert({
    where:  { email: 'staff@ricemill.pk' },
    update: {},
    create: { name: 'Ahmed Khan', email: 'staff@ricemill.pk', password: userPw, role: 'staff', phone: '+92-333-7654321', referralCode: 'RM-S5678' }
  });

  const supplierUser = await prisma.user.upsert({
    where:  { email: 'farmer@example.pk' },
    update: {},
    create: { name: 'Ghulam Hussain', email: 'farmer@example.pk', password: userPw, role: 'supplier', phone: '+92-321-9876543', referralCode: 'RM-F9012' }
  });
  await prisma.supplier.upsert({
    where:  { userId: supplierUser.id },
    update: {},
    create: { userId: supplierUser.id, businessName: 'Hussain Farms', address: 'Gujranwala, Punjab', contactPerson: 'Ghulam Hussain', phone: '+92-321-9876543' }
  });

  const customerUser = await prisma.user.upsert({
    where:  { email: 'buyer@example.pk' },
    update: {},
    create: { name: 'Tariq Mehmood', email: 'buyer@example.pk', password: userPw, role: 'customer', phone: '+92-302-5551234', referralCode: 'RM-T3456' }
  });
  const customer = await prisma.customer.upsert({
    where:  { userId: customerUser.id },
    update: {},
    create: { userId: customerUser.id, businessName: 'Mehmood Traders', address: 'Lahore, Punjab', contactPerson: 'Tariq Mehmood', phone: '+92-302-5551234', creditLimit: 500000 }
  });

  console.log('✓ Users created');

  // ─── STORE SETTINGS ────────────────────────────────────────────────────────
  await prisma.storeSettings.upsert({
    where:  { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'Al-Noor Rice Mills',
      tagline: 'Premium Quality Rice, Direct from Mill',
      phone: '+92-946-123456',
      email: 'ricemill@sameergul.com',
      address: 'Main GT Road, Near Batkhela Bus Stand, Batkhela, Malakand, KPK 23200',
      city: 'Batkhela',
      whatsappNumber: '+92-300-1234567',
      currency: 'PKR',
      shippingFee: 500,
      freeShippingAbove: 10000,
      minOrderKg: 5,
      isOpen: true,
      bannerTitle: 'Fresh Harvest 2025 — Now Available',
      bannerSubtitle: 'Premium Basmati & Super Kernel at mill-direct prices',
      notifyOrderConfirm: true,
      notifyStatusUpdate: true,
      notifyPayment: true,
      notifyLowStock: true,
    }
  });
  console.log('✓ Store settings created');

  // ─── PADDY STOCK ───────────────────────────────────────────────────────────
  const supplier = await prisma.supplier.findFirst({ where: { userId: supplierUser.id } });

  const paddyBasmati = await prisma.paddyStock.create({
    data: { variety: 'Basmati', quantityKg: 5000, qualityGrade: 'A', supplierId: supplier.id, purchasePrice: 95, notes: 'Sun-dried 3 days, moisture 13%' }
  });
  const paddySuperKernel = await prisma.paddyStock.create({
    data: { variety: 'Super Kernel', quantityKg: 8000, qualityGrade: 'A', supplierId: supplier.id, purchasePrice: 85, notes: 'Premium grade, low broken grain' }
  });
  const paddyIRRI6 = await prisma.paddyStock.create({
    data: { variety: 'IRRI-6', quantityKg: 12000, qualityGrade: 'B', supplierId: supplier.id, purchasePrice: 55, notes: 'Standard quality, good for blending' }
  });
  const paddyIRRI9 = await prisma.paddyStock.create({
    data: { variety: 'IRRI-9', quantityKg: 6500, qualityGrade: 'B', supplierId: supplier.id, purchasePrice: 50 }
  });
  console.log('✓ Paddy stock created');

  // ─── RICE STOCK ────────────────────────────────────────────────────────────
  const riceBasmatiA = await prisma.riceStock.create({
    data: { variety: 'Basmati', grade: 'A', quantityKg: 3200, pricePerKg: 380 }
  });
  const riceSKA = await prisma.riceStock.create({
    data: { variety: 'Super Kernel', grade: 'A', quantityKg: 5500, pricePerKg: 320 }
  });
  const riceIRRI6B = await prisma.riceStock.create({
    data: { variety: 'IRRI-6', grade: 'B', quantityKg: 8000, pricePerKg: 145 }
  });
  const riceIRRI6C = await prisma.riceStock.create({
    data: { variety: 'IRRI-6', grade: 'C', quantityKg: 3000, pricePerKg: 120 }
  });
  const riceIRRI9B = await prisma.riceStock.create({
    data: { variety: 'IRRI-9', grade: 'B', quantityKg: 4000, pricePerKg: 135 }
  });
  const ricePK386A = await prisma.riceStock.create({
    data: { variety: 'PK-386', grade: 'A', quantityKg: 2500, pricePerKg: 195 }
  });
  console.log('✓ Rice stock created');

  // ─── PRODUCTS ──────────────────────────────────────────────────────────────
  const products = [
    {
      name: 'Premium Basmati Reserve',
      variety: 'Basmati',
      grade: 'A',
      sku: 'RM-BSM-A-2501',
      shortDescription: 'Extra-long grain, aged 12 months. The finest Basmati from Malakand valley.',
      description: 'Our flagship Basmati Reserve is sourced from select farms in the Malakand valley and aged for 12 months in jute sacks before milling. Every grain is sun-dried in our open courtyard, ensuring uniform moisture of 12–14%. The result is a rice that cooks perfectly elongated, separates cleanly, and fills your kitchen with the unmistakable aroma of aged Basmati.',
      pricePerKg: 380,
      minOrderKg: 5,
      maxOrderKg: 500,
      isPublished: true,
      inStock: true,
      tags: 'basmati,premium,aged,aromatic',
      riceStockId: riceBasmatiA.id,
      sortOrder: 1,
      origin: 'Malakand Valley, KPK',
      processingType: 'Double Polished',
      moistureContent: '12–14%',
      grainLength: '8.2mm+',
      cookingTime: '18–22 minutes',
      aroma: 'Strong floral, pandan notes',
      brokenGrain: '< 1%',
      certifications: 'PCSIR, ISO 22000, HALAL',
      shelfLife: '24 months (sealed)',
      storageInstructions: 'Store in a cool, dry place away from direct sunlight. Keep sealed.',
      packaging: 'Jute sacks / PP bags (5kg, 10kg, 25kg, 50kg)',
      weight: 25,
      nutritionInfo: JSON.stringify([
        { nutrient: 'Energy', value: '356 kcal', unit: 'per 100g' },
        { nutrient: 'Carbohydrates', value: '78g', unit: 'per 100g' },
        { nutrient: 'Protein', value: '7.1g', unit: 'per 100g' },
        { nutrient: 'Fat', value: '0.6g', unit: 'per 100g' },
        { nutrient: 'Fibre', value: '0.4g', unit: 'per 100g' },
        { nutrient: 'Sodium', value: '5mg', unit: 'per 100g' },
      ]),
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
    },
    {
      name: 'Super Kernel Gold',
      variety: 'Super Kernel',
      grade: 'A',
      sku: 'RM-SK-A-2502',
      shortDescription: 'Hybrid Basmati with extra-long grain and exceptional yield.',
      description: 'Super Kernel is a premium Basmati hybrid prized for its extra-long grain and high yield. Milled at our Batkhela facility within 6 hours of processing, it retains its natural aroma and nutritional profile. Ideal for biryani, pilau, and dum pukht preparations.',
      pricePerKg: 320,
      minOrderKg: 5,
      isPublished: true,
      inStock: true,
      tags: 'super kernel,basmati,long grain,aromatic',
      riceStockId: riceSKA.id,
      sortOrder: 2,
      origin: 'Punjab / KPK',
      processingType: 'Single Polished',
      moistureContent: '12–14%',
      grainLength: '7.8mm+',
      cookingTime: '16–20 minutes',
      aroma: 'Medium floral',
      brokenGrain: '< 2%',
      certifications: 'HALAL, PSQCA',
      shelfLife: '18 months',
      storageInstructions: 'Store in a cool, dry place.',
      packaging: 'PP bags (5kg, 10kg, 25kg)',
      weight: 25,
      nutritionInfo: JSON.stringify([
        { nutrient: 'Energy', value: '349 kcal', unit: 'per 100g' },
        { nutrient: 'Carbohydrates', value: '76g', unit: 'per 100g' },
        { nutrient: 'Protein', value: '6.8g', unit: 'per 100g' },
        { nutrient: 'Fat', value: '0.5g', unit: 'per 100g' },
      ]),
      imageUrl: 'https://images.unsplash.com/photo-1568347877321-f8935c7dc5f7?w=800&q=80',
    },
    {
      name: 'IRRI-6 Standard',
      variety: 'IRRI-6',
      grade: 'B',
      sku: 'RM-IR6-B-2503',
      shortDescription: 'Reliable everyday rice. Medium grain, non-aromatic, excellent value.',
      description: 'IRRI-6 Standard is our most popular variety for everyday cooking. Medium grain, non-aromatic, and reliable — it absorbs flavors beautifully in curries, dals, and plain boiled rice. Milled fresh at our Batkhela facility to maintain quality.',
      pricePerKg: 145,
      minOrderKg: 10,
      isPublished: true,
      inStock: true,
      tags: 'irri-6,everyday,medium grain,value',
      riceStockId: riceIRRI6B.id,
      sortOrder: 3,
      origin: 'Sindh',
      processingType: 'Single Polished',
      moistureContent: '13–15%',
      grainLength: '5.5–6mm',
      cookingTime: '14–18 minutes',
      aroma: 'Mild',
      brokenGrain: '< 5%',
      certifications: 'PSQCA',
      shelfLife: '12 months',
      storageInstructions: 'Store in a cool, dry place.',
      packaging: 'PP bags (10kg, 25kg, 50kg)',
      weight: 25,
      nutritionInfo: JSON.stringify([
        { nutrient: 'Energy', value: '342 kcal', unit: 'per 100g' },
        { nutrient: 'Carbohydrates', value: '75g', unit: 'per 100g' },
        { nutrient: 'Protein', value: '6.5g', unit: 'per 100g' },
        { nutrient: 'Fat', value: '0.4g', unit: 'per 100g' },
      ]),
      imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&q=80',
    },
    {
      name: 'IRRI-6 Economy',
      variety: 'IRRI-6',
      grade: 'C',
      sku: 'RM-IR6-C-2504',
      shortDescription: 'Budget-friendly bulk rice. Ideal for institutions and large households.',
      description: 'Our IRRI-6 Economy grade offers great value for bulk buyers, institutions, and large families. While the grain size is smaller and broken grain % slightly higher, the taste and nutritional profile remain consistent with our standard mill quality.',
      pricePerKg: 120,
      minOrderKg: 25,
      isPublished: true,
      inStock: true,
      tags: 'irri-6,economy,bulk,institution',
      riceStockId: riceIRRI6C.id,
      sortOrder: 4,
      origin: 'Sindh',
      processingType: 'Single Polished',
      moistureContent: '13–15%',
      grainLength: '5–5.5mm',
      cookingTime: '14–18 minutes',
      aroma: 'Mild',
      brokenGrain: '5–10%',
      certifications: 'PSQCA',
      shelfLife: '12 months',
      storageInstructions: 'Store in a cool, dry place.',
      packaging: 'PP bags (25kg, 50kg)',
      weight: 50,
      imageUrl: 'https://images.unsplash.com/photo-1559181567-c3190ca9d70e?w=800&q=80',
    },
    {
      name: 'IRRI-9 Short Grain',
      variety: 'IRRI-9',
      grade: 'B',
      sku: 'RM-IR9-B-2505',
      shortDescription: 'High-starch short grain. Perfect for khichri and sticky rice dishes.',
      description: 'IRRI-9 is a short-grain, high-starch variety that becomes tender and slightly sticky when cooked — ideal for khichri, kheer, rice pudding, and any dish that benefits from a creamier texture. Popular with restaurants and household cooks across Pakistan.',
      pricePerKg: 135,
      minOrderKg: 10,
      isPublished: true,
      inStock: true,
      tags: 'irri-9,short grain,sticky,khichri',
      riceStockId: riceIRRI9B.id,
      sortOrder: 5,
      origin: 'Sindh',
      processingType: 'Single Polished',
      moistureContent: '13–14%',
      grainLength: '4.5–5mm',
      cookingTime: '12–15 minutes',
      aroma: 'Neutral',
      brokenGrain: '< 5%',
      certifications: 'HALAL, PSQCA',
      shelfLife: '12 months',
      storageInstructions: 'Store in a cool, dry place.',
      packaging: 'PP bags (10kg, 25kg)',
      weight: 25,
      imageUrl: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?w=800&q=80',
    },
    {
      name: 'PK-386 Fine Grain',
      variety: 'PK-386',
      grade: 'A',
      sku: 'RM-PK3-A-2506',
      shortDescription: 'Fine grain with excellent texture. A quality-price balance favourite.',
      description: 'PK-386 is a Pakistani-developed variety with a fine grain that offers an excellent balance of quality and price. Less aromatic than Basmati but with a pleasant mild flavour and clean white appearance. Widely used by restaurants, caterers, and retail buyers across Pakistan.',
      pricePerKg: 195,
      minOrderKg: 5,
      isPublished: true,
      inStock: true,
      tags: 'pk-386,fine grain,mid-range,restaurant',
      riceStockId: ricePK386A.id,
      sortOrder: 6,
      origin: 'Punjab',
      processingType: 'Double Polished',
      moistureContent: '12–13%',
      grainLength: '6.5–7mm',
      cookingTime: '15–18 minutes',
      aroma: 'Mild pleasant',
      brokenGrain: '< 2%',
      certifications: 'HALAL, PSQCA',
      shelfLife: '18 months',
      storageInstructions: 'Store in a cool, dry place.',
      packaging: 'PP bags (5kg, 10kg, 25kg)',
      weight: 25,
      imageUrl: 'https://images.unsplash.com/photo-1612257999756-e53e6c05ead7?w=800&q=80',
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });
  }
  console.log('✓ Products created (6 varieties)');

  // ─── MILL BATCHES ──────────────────────────────────────────────────────────
  await prisma.millBatch.upsert({
    where: { batchNumber: 'MB-2025-001' },
    update: {},
    create: {
      batchNumber: 'MB-2025-001', paddyStockId: paddyBasmati.id,
      inputQuantityKg: 1000, outputQuantityKg: 680, yieldPercent: 68,
      outputGrade: 'A', status: 'completed',
      startedAt: new Date('2025-11-01'), completedAt: new Date('2025-11-02'),
      staffId: admin.id, notes: 'Premium batch — moisture verified at 13.2%',
    }
  });
  await prisma.millBatch.upsert({
    where: { batchNumber: 'MB-2025-002' },
    update: {},
    create: {
      batchNumber: 'MB-2025-002', paddyStockId: paddySuperKernel.id,
      inputQuantityKg: 2000, outputQuantityKg: 1420, yieldPercent: 71,
      outputGrade: 'A', status: 'completed',
      startedAt: new Date('2025-11-10'), completedAt: new Date('2025-11-11'),
      staffId: admin.id,
    }
  });
  await prisma.millBatch.upsert({
    where: { batchNumber: 'MB-2025-003' },
    update: {},
    create: {
      batchNumber: 'MB-2025-003', paddyStockId: paddyIRRI6.id,
      inputQuantityKg: 3000, outputQuantityKg: 2100, yieldPercent: 70,
      outputGrade: 'B', status: 'in_progress',
      startedAt: new Date(),
      staffId: admin.id, notes: 'Batch in progress',
    }
  });
  console.log('✓ Mill batches created');

  // ─── PURCHASES ─────────────────────────────────────────────────────────────
  await prisma.purchase.create({
    data: {
      supplierId: supplier.id, variety: 'Basmati', quantityKg: 5000,
      pricePerKg: 95, totalAmount: 475000, paymentStatus: 'paid', paidAmount: 475000,
      receivedAt: new Date('2025-10-15'), notes: 'Season 2025 crop — verified quality',
    }
  }).catch(() => {});
  await prisma.purchase.create({
    data: {
      supplierId: supplier.id, variety: 'Super Kernel', quantityKg: 8000,
      pricePerKg: 85, totalAmount: 680000, paymentStatus: 'partial', paidAmount: 400000,
      receivedAt: new Date('2025-10-22'),
    }
  }).catch(() => {});
  await prisma.purchase.create({
    data: {
      supplierId: supplier.id, variety: 'IRRI-6', quantityKg: 12000,
      pricePerKg: 55, totalAmount: 660000, paymentStatus: 'unpaid', paidAmount: 0,
      receivedAt: new Date('2025-11-05'),
    }
  }).catch(() => {});
  console.log('✓ Purchases created');

  // ─── ORDERS ────────────────────────────────────────────────────────────────
  const riceBasmatiForOrder = await prisma.riceStock.findFirst({ where: { variety: 'Basmati', grade: 'A' } });
  const riceSKForOrder = await prisma.riceStock.findFirst({ where: { variety: 'Super Kernel', grade: 'A' } });

  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-202511-10001',
      customerId: customer.id,
      status: 'delivered',
      totalAmount: 19000,
      paidAmount: 19000,
      paymentStatus: 'paid',
      deliveryAddress: '45 Main Boulevard, Lahore, Punjab',
      source: 'internal',
      loyaltyPointsEarned: 190,
      notes: 'Deliver before noon',
      items: {
        create: [
          { riceStockId: riceBasmatiForOrder?.id, variety: 'Basmati', grade: 'A', quantityKg: 25, pricePerKg: 380, totalPrice: 9500 },
          { riceStockId: riceSKForOrder?.id, variety: 'Super Kernel', grade: 'A', quantityKg: 30, pricePerKg: 320, totalPrice: 9600 },
        ]
      }
    }
  }).catch(() => null);

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-202511-10002',
      customerId: customer.id,
      status: 'processing',
      totalAmount: 7250,
      paidAmount: 0,
      paymentStatus: 'unpaid',
      deliveryAddress: '45 Main Boulevard, Lahore, Punjab',
      source: 'online',
      loyaltyPointsEarned: 72,
      discountCode: 'WELCOME10',
      discountAmount: 750,
      items: {
        create: [
          { riceStockId: riceBasmatiForOrder?.id, variety: 'Basmati', grade: 'A', quantityKg: 20, pricePerKg: 380, totalPrice: 7600 },
        ]
      }
    }
  }).catch(() => null);
  console.log('✓ Orders created');

  // ─── REVIEWS ───────────────────────────────────────────────────────────────
  const productForReview = await prisma.product.findFirst({ where: { variety: 'Basmati' } });
  const productForReview2 = await prisma.product.findFirst({ where: { variety: 'Super Kernel' } });

  if (productForReview) {
    await prisma.review.upsert({
      where: { userId_productId: { userId: customerUser.id, productId: productForReview.id } },
      update: {},
      create: {
        userId: customerUser.id, productId: productForReview.id,
        rating: 5, status: 'approved', verifiedPurchase: true, helpfulCount: 12,
        comment: 'Excellent Basmati! The grain is long and aromatic. Cooked perfectly for biryani — each grain separate and fluffy. Will definitely order again.',
      }
    });
  }

  if (productForReview2) {
    // Create another user for a second review
    const reviewUser2 = await prisma.user.upsert({
      where: { email: 'sara@example.pk' },
      update: {},
      create: { name: 'Sara Ahmed', email: 'sara@example.pk', password: userPw, role: 'customer', phone: '+92-315-2223333', referralCode: 'RM-S9999' }
    });
    await prisma.customer.upsert({
      where: { userId: reviewUser2.id },
      update: {},
      create: { userId: reviewUser2.id, businessName: 'Home Kitchen', phone: '+92-315-2223333' }
    });
    await prisma.review.upsert({
      where: { userId_productId: { userId: reviewUser2.id, productId: productForReview2.id } },
      update: {},
      create: {
        userId: reviewUser2.id, productId: productForReview2.id,
        rating: 5, status: 'approved', verifiedPurchase: false, helpfulCount: 8,
        comment: 'Super Kernel is our family favourite. We order 25kg every month. The quality is consistent and the price is fair for mill-direct.',
      }
    });

    const reviewUser3 = await prisma.user.upsert({
      where: { email: 'hassan.restaurant@example.pk' },
      update: {},
      create: { name: 'Hassan Nawaz', email: 'hassan.restaurant@example.pk', password: userPw, role: 'customer', phone: '+92-321-4445556', referralCode: 'RM-H7777' }
    });
    await prisma.customer.upsert({
      where: { userId: reviewUser3.id },
      update: {},
      create: { userId: reviewUser3.id, businessName: 'Nawaz Restaurant', phone: '+92-321-4445556' }
    });
    const productForReview3 = await prisma.product.findFirst({ where: { variety: 'IRRI-6' } });
    if (productForReview3) {
      await prisma.review.upsert({
        where: { userId_productId: { userId: reviewUser3.id, productId: productForReview3.id } },
        update: {},
        create: {
          userId: reviewUser3.id, productId: productForReview3.id,
          rating: 4, status: 'approved', verifiedPurchase: true, helpfulCount: 5,
          comment: 'We use IRRI-6 Standard for all our rice dishes. Good value, consistent quality. The 50kg bags are convenient for our kitchen.',
        }
      });
    }
  }
  console.log('✓ Reviews created');

  // ─── BLOG POSTS ────────────────────────────────────────────────────────────
  const blogPosts = [
    {
      title: 'Why Aged Basmati Is Worth the Premium',
      slug: 'why-aged-basmati-worth-premium',
      excerpt: 'Aging rice is not a marketing trick. Here is the science behind why 12-month aged Basmati cooks differently — and tastes better.',
      content: `Aging rice is one of the oldest and least-understood practices in the milling industry. At Al-Noor Rice Mills, every batch of Basmati Reserve is aged for a minimum of 12 months before milling. Here is why it matters.\n\n## The Science of Aging\n\nFresh-harvested paddy contains moisture levels of 20–25%. During aging in jute sacks at our Batkhela facility, two things happen:\n\n**1. Moisture equilibration** — The grain slowly releases moisture to reach 12–14%, the ideal level for cooking. Rapid drying (kiln-drying) can shock the grain and cause hairline cracks, leading to higher broken grain percentages.\n\n**2. Starch crystallization** — The starch molecules in aged rice are more ordered and crystalline. This means the grain absorbs water more evenly during cooking, resulting in perfectly elongated grains that separate cleanly.\n\n## The Taste Difference\n\nAged Basmati develops more complex aromatic compounds over time — particularly 2-acetyl-1-pyrroline (2-AP), the compound responsible for the classic pandan-like Basmati aroma. Fresh rice simply does not have the same aromatic depth.\n\n## Our Process\n\nWe source paddy directly from Malakand valley farmers at harvest, sun-dry it for three days in our open courtyard, then store it in ventilated jute sacks for 12 months before milling. The result is in every grain.`,
      isPublished: true,
      publishedAt: new Date('2025-10-15'),
      coverImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200&q=80',
    },
    {
      title: 'How to Store Rice to Keep It Fresh',
      slug: 'how-to-store-rice-fresh',
      excerpt: 'Bought a 25kg sack? Here is how to store it so the last kilogram is as fresh as the first.',
      content: `A common question we receive: "How do I store a large sack of rice without it going stale or getting insects?"\n\n## The Enemies of Fresh Rice\n\n**Moisture** is the main villain. Rice absorbs ambient humidity, which causes it to clump, develop off-flavours, and eventually mould. Keep rice away from the kitchen sink and any damp walls.\n\n**Light** degrades aromatic compounds over time — particularly in Basmati. Dark storage is better.\n\n**Pests** (weevils, moths) love rice. A few bay leaves placed in the container act as a natural deterrent.\n\n## Best Storage Method\n\n1. Transfer the rice into an airtight container — food-grade plastic bins or steel drums work well.\n2. Add 2–3 dry bay leaves.\n3. Store in a cool, dark location — ideally below 25°C.\n4. Avoid storing near strong-smelling spices or chemicals, as rice absorbs odours.\n\n## How Long Can You Store It?\n\n- **White rice** (polished): 18–24 months sealed, 6 months after opening if stored correctly.\n- **Basmati**: The aromatic compounds degrade over time. Use within 12 months of purchase for best aroma.\n\nAt Al-Noor Rice Mills, we print the milling date on every bag so you always know how fresh your rice is.`,
      isPublished: true,
      publishedAt: new Date('2025-11-01'),
      coverImage: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=1200&q=80',
    },
    {
      title: '2025 Harvest Update — Bumper Season for Basmati',
      slug: '2025-harvest-update-basmati',
      excerpt: 'This year\'s Basmati crop from Malakand and Punjab is exceptional. Here is what it means for quality and pricing.',
      content: `We are pleased to report that the 2025 Basmati harvest has been one of the best in recent memory for our region. Here is what we are seeing on the ground.\n\n## Crop Quality\n\nThe 2025 Malakand valley Basmati crop benefited from near-ideal conditions:\n- Adequate monsoon rainfall followed by dry, sunny weather during maturity\n- Fewer pest pressures than 2024\n- Higher-than-average grain length (averaging 8.3mm in our first batches)\n\nMoisture levels at harvest were around 22%, which is excellent — lower than normal, which means less stress on the grain during drying.\n\n## What This Means for Prices\n\nA good harvest typically means more supply and competitive pricing. We are holding our Basmati Reserve price at PKR 380/kg for the season and expect to maintain this through Q1 2026.\n\n## Wholesale Buyers\n\nIf you are considering a bulk purchase for the season, now is a good time. Stock early and you lock in the current price. Contact us on WhatsApp for container-scale quotes with FOB Karachi pricing.\n\n— The Al-Noor Team, Batkhela`,
      isPublished: true,
      publishedAt: new Date('2025-11-20'),
      coverImage: 'https://images.unsplash.com/photo-1568347877321-f8935c7dc5f7?w=1200&q=80',
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }
  console.log('✓ Blog posts created');

  // ─── CAREERS ───────────────────────────────────────────────────────────────
  const careers = [
    {
      title: 'Mill Operations Supervisor',
      department: 'Operations',
      location: 'Batkhela, Malakand, KPK',
      type: 'full-time',
      experienceLevel: 'mid',
      salaryMin: 60000,
      salaryMax: 90000,
      showSalary: true,
      description: 'We are looking for an experienced Mill Operations Supervisor to oversee daily milling, paddy procurement quality checks, and batch tracking at our Batkhela facility.',
      responsibilities: JSON.stringify(['Supervise daily milling operations (6AM–4PM shift)', 'Quality check incoming paddy batches', 'Monitor moisture levels and document batch records', 'Coordinate with procurement team on paddy scheduling', 'Train and manage 4–6 mill workers']),
      requirements: JSON.stringify(['3+ years experience in rice milling or similar food processing', 'Ability to assess grain quality visually', 'Basic computer literacy (for batch records)', 'Strong communication skills in Urdu/Pashto', 'Physically fit for a mill environment']),
      niceToHave: JSON.stringify(['Formal training in food safety / HACCP', 'Experience with AI-powered inventory systems', 'Driving license']),
      benefits: JSON.stringify(['Competitive salary', 'EOBI registration', 'Annual bonus', 'Free lunch on site', 'Accommodation support for outstation candidates']),
      isOpen: true,
      isFeatured: true,
      totalApplications: 3,
    },
    {
      title: 'E-Commerce & Digital Marketing Executive',
      department: 'Marketing',
      location: 'Batkhela, KPK (Remote-friendly)',
      type: 'full-time',
      experienceLevel: 'entry',
      salaryMin: 45000,
      salaryMax: 65000,
      showSalary: true,
      description: 'Help Al-Noor Rice Mills grow its online presence and e-commerce operations. You will manage our storefront, social media, and customer communications.',
      responsibilities: JSON.stringify(['Manage and update our online store (product listings, pricing, descriptions)', 'Create content for social media (Instagram, Facebook, TikTok)', 'Respond to customer enquiries on WhatsApp and email', 'Monitor online orders and coordinate with dispatch', 'Track website analytics and report weekly']),
      requirements: JSON.stringify(['1+ year experience in e-commerce or digital marketing', 'Good written Urdu and English', 'Familiar with social media platforms', 'Basic photo editing skills (Canva is fine)']),
      benefits: JSON.stringify(['Competitive salary', 'Work-from-home flexibility', 'Annual bonus', 'Career growth in a fast-growing company']),
      isOpen: true,
      isFeatured: false,
      totalApplications: 7,
    },
    {
      title: 'Accounts & Finance Assistant',
      department: 'Finance',
      location: 'Batkhela, Malakand, KPK',
      type: 'full-time',
      experienceLevel: 'entry',
      salaryMin: 40000,
      salaryMax: 55000,
      showSalary: true,
      description: 'Support our finance team with daily bookkeeping, supplier payment tracking, and financial reporting.',
      responsibilities: JSON.stringify(['Record daily transactions in accounting software', 'Process supplier and vendor payments', 'Prepare weekly and monthly financial summaries', 'Assist with tax filings and audit preparation', 'Maintain petty cash records']),
      requirements: JSON.stringify(['B.Com or equivalent degree', '1+ year experience in bookkeeping or accounts', 'Proficiency in MS Excel', 'Attention to detail and accuracy']),
      benefits: JSON.stringify(['Competitive salary', 'EOBI registration', 'Annual bonus']),
      isOpen: true,
      isFeatured: false,
      totalApplications: 2,
    },
  ];

  for (const career of careers) {
    const existing = await prisma.career.findFirst({ where: { title: career.title } });
    if (!existing) await prisma.career.create({ data: career });
  }
  console.log('✓ Career postings created');

  // ─── FAQ ───────────────────────────────────────────────────────────────────
  const faqs = [
    { question: 'What is the minimum order quantity?', answer: 'Minimum order is 5kg for retail customers ordering online. For wholesale accounts (50kg+), please visit our Wholesale page or contact us on WhatsApp.', sortOrder: 1, isActive: true },
    { question: 'Do you deliver all over Pakistan?', answer: 'Yes. We deliver nationwide via TCS Courier and Leopards Express. Orders to Batkhela and Malakand district receive same-day or next-day delivery. Other cities: 3–5 business days.', sortOrder: 2, isActive: true },
    { question: 'Is Cash on Delivery available?', answer: 'Yes — COD is available on all orders across Pakistan. We also accept Bank Transfer, EasyPaisa, and JazzCash. Credit/debit card payments are available via Stripe.', sortOrder: 3, isActive: true },
    { question: 'What is the difference between Grade A, B, and C?', answer: 'Grade A has the longest grain, lowest broken grain percentage (< 1–2%), and best aroma. Grade B is standard quality with slightly more variation. Grade C is our economy grade, ideal for bulk institutional use where absolute uniformity is not required.', sortOrder: 4, isActive: true },
    { question: 'Can I visit the mill in Batkhela?', answer: 'Absolutely. Our mill is open Mon–Sat, 8 AM to 6 PM. You are welcome to visit, see the milling process, and pick up orders directly. Address: Main GT Road, Near Batkhela Bus Stand, Batkhela, Malakand.', sortOrder: 5, isActive: true },
    { question: 'Do you offer export documentation?', answer: 'Yes. For container-scale orders (5,000kg+), we provide full phytosanitary certificates, COO (Certificate of Origin), and FOB Karachi documentation. Contact us for export enquiries.', sortOrder: 6, isActive: true },
  ];

  for (const faq of faqs) {
    const existing = await prisma.fAQ.findFirst({ where: { question: faq.question } });
    if (!existing) await prisma.fAQ.create({ data: faq });
  }
  console.log('✓ FAQs created');

  // ─── PRICING TIERS ─────────────────────────────────────────────────────────
  const tiers = [
    { label: 'RETAIL', rangeLabel: '5 – 49 kg', discount: null, description: 'Standard catalogue pricing for household orders', ctaText: 'Shop now', ctaType: 'link', sortOrder: 1, isActive: true },
    { label: 'TRADE', rangeLabel: '50 – 499 kg', discount: '−12% across all varieties', description: 'For traders, shops, and small restaurants', ctaText: 'Request quote', ctaType: 'quote', sortOrder: 2, isActive: true },
    { label: 'WHOLESALE', rangeLabel: '500 – 4,999 kg', discount: '−18% · dedicated account manager', description: 'Wholesale pricing with a dedicated manager and flexible delivery', ctaText: 'Request quote', ctaType: 'quote', sortOrder: 3, isActive: true },
    { label: 'CONTAINER', rangeLabel: '5,000 kg+', discount: 'Bespoke · FOB Karachi · export docs', description: 'Container-scale orders with full export documentation', ctaText: 'Speak to founders', ctaType: 'contact', sortOrder: 4, isActive: true },
  ];

  for (const tier of tiers) {
    const existing = await prisma.pricingTier.findFirst({ where: { label: tier.label } });
    if (!existing) await prisma.pricingTier.create({ data: tier });
  }
  console.log('✓ Pricing tiers created');

  // ─── DISCOUNTS ─────────────────────────────────────────────────────────────
  const discounts = [
    { code: 'WELCOME10', description: '10% off your first order', type: 'percentage', value: 10, minOrderAmt: 2000, usageLimit: 100, usedCount: 3, isActive: true },
    { code: 'BULK500', description: 'PKR 500 off orders above 50kg', type: 'fixed', value: 500, minOrderAmt: 7000, usageLimit: 50, usedCount: 1, isActive: true },
    { code: 'EID2025', description: 'Eid special — 15% off', type: 'percentage', value: 15, minOrderAmt: 3000, usageLimit: 200, usedCount: 45, isActive: false, expiresAt: new Date('2025-04-15') },
  ];

  for (const d of discounts) {
    await prisma.discount.upsert({ where: { code: d.code }, update: {}, create: d });
  }
  console.log('✓ Discount codes created');

  // ─── EXPENSES ──────────────────────────────────────────────────────────────
  const expenses = [
    { category: 'electricity', amount: 45000, description: 'October 2025 WAPDA bill — mill + office', date: new Date('2025-10-31') },
    { category: 'maintenance', amount: 28000, description: 'Rice huller blade replacement — Unit 2', date: new Date('2025-10-20') },
    { category: 'labour', amount: 180000, description: 'November 2025 wages — 12 staff', date: new Date('2025-11-30') },
    { category: 'transport', amount: 35000, description: 'TCS + Leopards courier charges — November', date: new Date('2025-11-30') },
    { category: 'electricity', amount: 52000, description: 'November 2025 WAPDA bill', date: new Date('2025-11-30') },
    { category: 'other', amount: 12000, description: 'PP bags and jute sacks — monthly stock', date: new Date('2025-11-15') },
  ];
  for (const e of expenses) {
    await prisma.expense.create({ data: e }).catch(() => {});
  }
  console.log('✓ Expenses created');

  // ─── NEWSLETTER SUBSCRIBERS ────────────────────────────────────────────────
  const subscribers = ['ali@example.com', 'sara.biryani@gmail.com', 'restaurant.lahore@outlook.com', 'wholesale.khi@example.pk', 'foodblogger@example.com'];
  for (const email of subscribers) {
    await prisma.newsletter.upsert({ where: { email }, update: {}, create: { email, isActive: true } });
  }
  console.log('✓ Newsletter subscribers created');

  // ─── WHOLESALE INQUIRIES ───────────────────────────────────────────────────
  await prisma.wholesaleInquiry.create({
    data: {
      name: 'Riaz Ahmed', email: 'riaz@foodservice.pk', phone: '+92-321-5557890',
      quantityKg: 2000, deliveryCity: 'Karachi', riceVariety: 'Basmati',
      message: 'We run a chain of 5 restaurants in Karachi and need monthly supply of premium Basmati. Please quote for 2T/month.',
      status: 'reviewing',
    }
  }).catch(() => {});
  await prisma.wholesaleInquiry.create({
    data: {
      name: 'Dubai Export Co.', email: 'procurement@dubaiexport.ae', phone: '+971-50-1234567',
      quantityKg: 10000, deliveryCity: 'Karachi Port',
      message: 'We are looking for a reliable Pakistani rice supplier for export to UAE. Need 10MT Super Kernel monthly.',
      status: 'new',
    }
  }).catch(() => {});
  console.log('✓ Wholesale inquiries created');

  console.log('\n✅ Database seeded successfully!');
  console.log('\nLogin credentials:');
  console.log('  Admin    → admin@ricemill.pk / admin123');
  console.log('  Staff    → staff@ricemill.pk / password123');
  console.log('  Supplier → farmer@example.pk / password123');
  console.log('  Customer → buyer@example.pk  / password123');
  console.log('\nData created:');
  console.log('  • 6 rice products (Basmati, Super Kernel, IRRI-6 std/eco, IRRI-9, PK-386)');
  console.log('  • 4 paddy stock entries + 5 rice stock entries');
  console.log('  • 3 mill batches (2 completed, 1 in progress)');
  console.log('  • 3 supplier purchases');
  console.log('  • 2 customer orders');
  console.log('  • 3 approved reviews');
  console.log('  • 3 blog posts');
  console.log('  • 3 career postings');
  console.log('  • 6 FAQs');
  console.log('  • 4 pricing tiers');
  console.log('  • 3 discount codes');
  console.log('  • 6 expenses');
  console.log('  • 5 newsletter subscribers');
  console.log('  • 2 wholesale inquiries');
}

main().catch(console.error).finally(() => prisma.$disconnect());
