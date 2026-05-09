import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Shop from '../models/Shop';
import { generateToken } from '../utils/jwt';

export const registerCustomer = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'customer',
      address: address ? {
        ...address,
        location: address.coordinates ? {
          type: 'Point',
          coordinates: address.coordinates
        } : undefined
      } : undefined
    });

    const token = generateToken(user._id as string, user.role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error: any) {
    console.error('❌ Register Customer Error:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Failed', details: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};

export const registerShopkeeper = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, shopName, category, address, deliveryRadius } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'shopkeeper',
    });

    const shop = await Shop.create({
      userId: user._id,
      shopName,
      category,
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        location: {
          type: 'Point',
          coordinates: address.coordinates
        }
      },
      deliveryRadius
    });

    const token = generateToken(user._id as string, user.role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      shopId: shop._id,
      token
    });
  } catch (error: any) {
    console.error('❌ Register Shopkeeper Error:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Failed', details: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log(`🔑 Login attempt: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id as string, user.role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const logoutUser = (req: Request, res: Response) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let shop = null;
    if (user.role === 'shopkeeper') {
      shop = await Shop.findOne({ userId: user._id });
    }
    
    res.status(200).json({ user, shop });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
