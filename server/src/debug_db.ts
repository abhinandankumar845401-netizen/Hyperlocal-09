import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Shop from './models/Shop';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trustlocal';

async function verify() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const shopCount = await Shop.countDocuments();
    console.log(`📊 Total shops in DB: ${shopCount}`);

    const shops = await Shop.find().limit(3);
    console.log('🔍 First 3 shops:', JSON.stringify(shops, null, 2));

    // Test a nearby query (Connaught Place)
    const lat = 28.6315;
    const lng = 77.2090;
    const nearby = await Shop.find({
      'address.location': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: 5000,
        },
      },
    });
    console.log(`📍 Shops within 5km of CP: ${nearby.length}`);

    if (nearby.length === 0) {
      console.log('❌ No shops found nearby! Checking all shop coordinates...');
      const allShops = await Shop.find({}, { 'address.location': 1, shopName: 1 });
      allShops.forEach(s => {
        console.log(` - ${s.shopName}: ${JSON.stringify(s.address.location.coordinates)}`);
      });
    }

  } catch (err: any) {
    console.error('❌ Verification error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

verify();
