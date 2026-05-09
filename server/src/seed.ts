/**
 * Seed Script — 20 sample shops spread around Delhi/NCR area
 * Run with: npx tsx src/seed.ts
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Shop from './models/Shop';
import User from './models/User';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trustlocal';

const SEED_SHOPS = [
  {
    shopName: "Sharma's Grocery",
    category: 'Grocery',
    description: 'Fresh vegetables, fruits, dairy & daily essentials delivered fast.',
    street: '123 Market St',
    city: 'Delhi',
    state: 'Delhi',
    zipCode: '110001',
    coordinates: [77.2090, 28.6139],
    trustScore: 92,
    isVerified: true,
    isOpen: true,
    businessHours: '8:00 AM - 10:00 PM',
    deliveryRadius: 3,
  },
  {
    shopName: 'MedPlus Pharmacy',
    category: 'Pharmacy',
    description: 'Medicines, healthcare products & OTC drugs. Open 24x7.',
    street: '45 Health Ave',
    city: 'Delhi',
    state: 'Delhi',
    zipCode: '110001',
    coordinates: [77.2150, 28.6200],
    trustScore: 98,
    isVerified: true,
    isOpen: true,
    businessHours: '24 Hours',
    deliveryRadius: 5,
  },
  {
    shopName: 'Speedy Repairs',
    category: 'Repairs',
    description: 'AC, fridge, washing machine & appliance repair at home.',
    street: '88 Mechanic Rd',
    city: 'Delhi',
    state: 'Delhi',
    zipCode: '110002',
    coordinates: [77.2300, 28.6300],
    trustScore: 85,
    isVerified: false,
    isOpen: false,
    businessHours: '10:00 AM - 7:00 PM',
    deliveryRadius: 10,
  },
  {
    shopName: 'TechZone Electronics',
    category: 'Electronics',
    description: 'Mobiles, laptops, accessories & fast repair services.',
    street: 'Nehru Place Electronic Market',
    city: 'New Delhi',
    state: 'Delhi',
    zipCode: '110019',
    coordinates: [77.2509, 28.5491],
    trustScore: 91,
    isVerified: true,
    deliveryRadius: 7,
    isOpen: true,
    businessHours: '10:00 AM - 8:00 PM',
  },
  {
    shopName: 'Daily Bakery',
    category: 'Bakery',
    description: 'Fresh breads, cakes, pastries baked every morning.',
    street: '5 Lajpat Nagar Central Market',
    city: 'New Delhi',
    state: 'Delhi',
    zipCode: '110024',
    coordinates: [77.2373, 28.5677],
    trustScore: 94,
    isVerified: true,
    deliveryRadius: 3,
    isOpen: true,
    businessHours: '7:00 AM - 10:00 PM',
  },
  {
    shopName: 'Fashion Hub',
    category: 'Clothing',
    description: 'Trendy ethnic wear, western outfits & accessories for all.',
    street: 'Sarojini Nagar Market, Block C',
    city: 'New Delhi',
    state: 'Delhi',
    zipCode: '110023',
    coordinates: [77.1989, 28.5773],
    trustScore: 88,
    isVerified: false,
    deliveryRadius: 4,
    isOpen: true,
    businessHours: '11:00 AM - 9:00 PM',
  },
  {
    shopName: 'QuickFix Repairs',
    category: 'Repairs',
    description: 'AC, fridge, washing machine & appliance repair at home.',
    street: 'Karol Bagh, Block 4',
    city: 'New Delhi',
    state: 'Delhi',
    zipCode: '110005',
    coordinates: [77.1898, 28.6517],
    trustScore: 92,
    isVerified: true,
    deliveryRadius: 8,
    isOpen: true,
    businessHours: '9:00 AM - 8:00 PM',
  },
  {
    shopName: 'Green Basket Organics',
    category: 'Grocery',
    description: 'Certified organic produce, millets & superfoods.',
    street: 'Defence Colony Market',
    city: 'New Delhi',
    state: 'Delhi',
    zipCode: '110024',
    coordinates: [77.2296, 28.5755],
    trustScore: 97,
    isVerified: true,
    deliveryRadius: 5,
    isOpen: true,
    businessHours: '8:00 AM - 9:00 PM',
  },
  {
    shopName: 'BookNook Store',
    category: 'Books',
    description: 'Secondhand and new books, stationery & art supplies.',
    street: 'Daryaganj Book Market',
    city: 'New Delhi',
    state: 'Delhi',
    zipCode: '110002',
    coordinates: [77.2373, 28.6430],
    trustScore: 90,
    isVerified: true,
    deliveryRadius: 6,
    isOpen: true,
    businessHours: '10:00 AM - 7:00 PM',
  },
  {
    shopName: 'Spice Garden Restaurant',
    category: 'Food',
    description: 'Authentic North Indian & Mughlai cuisine. Home delivery.',
    street: 'Chandni Chowk, Main Road',
    city: 'New Delhi',
    state: 'Delhi',
    zipCode: '110006',
    coordinates: [77.2302, 28.6562],
    trustScore: 95,
    isVerified: true,
    deliveryRadius: 4,
    isOpen: true,
    businessHours: '12:00 PM - 11:00 PM',
  },
  {
    shopName: 'PetCare Plus',
    category: 'Pet Store',
    description: 'Pet food, grooming, accessories & vet consultation.',
    street: 'Greater Kailash Part 1',
    city: 'New Delhi',
    state: 'Delhi',
    zipCode: '110048',
    coordinates: [77.2373, 28.5480],
    trustScore: 89,
    isVerified: true,
    deliveryRadius: 5,
    isOpen: true,
    businessHours: '10:00 AM - 8:00 PM',
  },
  {
    shopName: 'GoldStar Jewellers',
    category: 'Jewellery',
    description: 'Hallmarked gold, silver & diamond jewellery since 1985.',
    street: 'Karol Bagh Jewellery Lane',
    city: 'New Delhi',
    state: 'Delhi',
    zipCode: '110005',
    coordinates: [77.1935, 28.6528],
    trustScore: 99,
    isVerified: true,
    deliveryRadius: 10,
    isOpen: true,
    businessHours: '11:00 AM - 8:00 PM',
  },
  {
    shopName: 'FitLife Supplements',
    category: 'Health & Fitness',
    description: 'Protein powders, vitamins, gym gear & nutrition advice.',
    street: 'Vasant Kunj, Sector C',
    city: 'New Delhi',
    state: 'Delhi',
    zipCode: '110070',
    coordinates: [77.1540, 28.5226],
    trustScore: 86,
    isVerified: false,
    deliveryRadius: 6,
    isOpen: true,
    businessHours: '10:00 AM - 9:00 PM',
  },
  {
    shopName: 'HomeDecor World',
    category: 'Home Decor',
    description: 'Furniture, wall art, lighting & interior design products.',
    street: 'South Extension Part 2',
    city: 'New Delhi',
    state: 'Delhi',
    zipCode: '110049',
    coordinates: [77.2173, 28.5639],
    trustScore: 87,
    isVerified: true,
    deliveryRadius: 7,
    isOpen: true,
    businessHours: '10:30 AM - 8:30 PM',
  },
  {
    shopName: 'KidZone Toys',
    category: 'Toys',
    description: 'Educational toys, board games, and fun gifts for all ages.',
    street: 'Janpath Market, Connaught Place',
    city: 'New Delhi',
    state: 'Delhi',
    zipCode: '110001',
    coordinates: [77.2195, 28.6293],
    trustScore: 93,
    isVerified: true,
    deliveryRadius: 5,
    isOpen: true,
    businessHours: '10:00 AM - 9:00 PM',
  },
  {
    shopName: 'AutoCare Garage',
    category: 'Automobile',
    description: 'Car servicing, denting, painting & doorstep pickup.',
    street: 'Okhla Industrial Area Phase 1',
    city: 'New Delhi',
    state: 'Delhi',
    zipCode: '110020',
    coordinates: [77.2673, 28.5360],
    trustScore: 84,
    isVerified: false,
    deliveryRadius: 10,
    isOpen: true,
    businessHours: '9:00 AM - 7:00 PM',
  },
  {
    shopName: 'Fresh Dairy Corner',
    category: 'Dairy',
    description: 'Pure desi milk, curd, paneer, butter & ghee daily.',
    street: 'Pitampura Sector 13',
    city: 'New Delhi',
    state: 'Delhi',
    zipCode: '110034',
    coordinates: [77.1302, 28.6991],
    trustScore: 96,
    isVerified: true,
    deliveryRadius: 4,
    isOpen: true,
    businessHours: '6:00 AM - 10:00 PM',
  },
  {
    shopName: 'CloudPrint Studio',
    category: 'Printing',
    description: 'Visiting cards, banners, flex prints & digital printing.',
    street: 'Laxmi Nagar Main Market',
    city: 'New Delhi',
    state: 'Delhi',
    zipCode: '110092',
    coordinates: [77.2760, 28.6305],
    trustScore: 88,
    isVerified: true,
    deliveryRadius: 5,
    isOpen: true,
    businessHours: '10:00 AM - 8:00 PM',
  },
  {
    shopName: 'Bloom Florals',
    category: 'Flowers',
    description: 'Fresh flowers, bouquets, wreaths & event decorations.',
    street: 'INA Market, Africa Avenue',
    city: 'New Delhi',
    state: 'Delhi',
    zipCode: '110023',
    coordinates: [77.2079, 28.5842],
    trustScore: 91,
    isVerified: true,
    deliveryRadius: 5,
    isOpen: true,
    businessHours: '8:00 AM - 9:00 PM',
  },
  {
    shopName: 'The Laundry Box',
    category: 'Laundry',
    description: 'Pickup & delivery laundry, dry cleaning & ironing.',
    street: 'Dwarka Sector 6',
    city: 'New Delhi',
    state: 'Delhi',
    zipCode: '110075',
    coordinates: [77.0388, 28.5921],
    trustScore: 85,
    isVerified: true,
    deliveryRadius: 6,
    isOpen: true,
    businessHours: '9:00 AM - 9:00 PM',
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create a seed owner user if not exists
    let owner = await User.findOne({ email: 'seed@trustlocal.com' });
    if (!owner) {
      const hashed = await bcrypt.hash('SeedPass@123', 10);
      owner = await User.create({
        name: 'TrustLocal Seed',
        email: 'seed@trustlocal.com',
        password: hashed,
        role: 'shopkeeper',
      });
      console.log('✅ Created seed user');
    }

    // Create a test customer user if not exists
    let testUser = await User.findOne({ email: 'test@trustlocal.com' });
    if (!testUser) {
      const hashed = await bcrypt.hash('Test@1234', 10);
      testUser = await User.create({
        name: 'Test User',
        email: 'test@trustlocal.com',
        password: hashed,
        role: 'customer',
      });
      console.log('✅ Created test customer user');
    }

    // Drop old non-sparse geo index on users to prevent geo key errors
    try {
      await mongoose.connection.db!.collection('users').dropIndex('address.location_2dsphere');
      console.log('🗑️  Dropped old user geo index');
    } catch {
      // Index may not exist — that's fine
    }

    // Clear old seeded shops
    await Shop.deleteMany({ userId: owner._id });
    console.log('🗑️  Cleared old seed shops');

    // Insert all shops
    const shopDocs = SEED_SHOPS.map((s) => ({
      userId: owner!._id,
      shopName: s.shopName,
      category: s.category,
      description: s.description,
      address: {
        street: s.street,
        city: s.city,
        state: s.state,
        zipCode: s.zipCode,
        location: {
          type: 'Point',
          coordinates: s.coordinates, // [lng, lat]
        },
      },
      trustScore: s.trustScore,
      isVerified: s.isVerified,
      isOpen: s.isOpen ?? true,
      businessHours: s.businessHours ?? '9:00 AM - 9:00 PM',
      deliveryRadius: s.deliveryRadius,
    }));

    await Shop.insertMany(shopDocs);
    console.log(`✅ Seeded ${shopDocs.length} shops successfully!`);
    console.log('\nShops seeded:');
    SEED_SHOPS.forEach((s, i) => console.log(`  ${i + 1}. ${s.shopName} (${s.category})`));
  } catch (err: any) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();
