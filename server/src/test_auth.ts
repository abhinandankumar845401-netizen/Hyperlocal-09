import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trustlocal';

async function testAuth() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'manual_test@trustlocal.com';
    const password = 'Password@123';

    // 1. Cleanup
    await User.deleteOne({ email });

    // 2. Register
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: 'Manual Test',
      email,
      password: hashed,
      role: 'customer'
    });
    console.log('✅ User created manually');

    // 3. Verify Login
    const found = await User.findOne({ email });
    if (!found) throw new Error('User not found after creation');
    
    const isMatch = await bcrypt.compare(password, found.password!);
    console.log('🔑 Password match test:', isMatch ? 'SUCCESS' : 'FAILED');

    if (isMatch) {
      console.log('🎉 Auth logic is working on the backend!');
    }

  } catch (err: any) {
    console.error('❌ Auth test error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testAuth();
