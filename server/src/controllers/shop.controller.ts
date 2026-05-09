import type { Request, Response } from 'express';
import Shop from '../models/Shop';

// GET /api/shops/nearby?lat=X&lng=Y&radius=5&category=Grocery
export const getNearbyShops = async (req: Request, res: Response) => {
  try {
    const { lng, lat, radius = '5', category } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }

    const longitude = parseFloat(lng as string);
    const latitude = parseFloat(lat as string);
    const maxDistance = parseFloat(radius as string) * 1000; // km → meters

    if (Number.isNaN(longitude) || Number.isNaN(latitude) || Number.isNaN(maxDistance)) {
      return res.status(400).json({ message: 'Invalid coordinates or radius' });
    }

    const query: any = {
      'address.location': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistance,
        },
      },
    };

    if (category && category !== 'All') {
      query.category = category;
    }

    const shops = await Shop.find(query).populate('userId', 'name email').limit(30);

    // 1st Fallback: Try 50km
    if (shops.length === 0 && parseFloat(radius as string) < 50) {
      query['address.location'].$near.$maxDistance = 50000;
      const fallbackShops = await Shop.find(query).populate('userId', 'name email').limit(30);
      if (fallbackShops.length > 0) return res.status(200).json(fallbackShops);
    }

    // 2nd Fallback: Just return all shops (for demo/testing from far away)
    if (shops.length === 0) {
      const allShops = await Shop.find().populate('userId', 'name email').limit(30);
      return res.status(200).json(allShops);
    }

    res.status(200).json(shops);
  } catch (error: any) {
    console.error('getNearbyShops error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/shops/:id
export const getShopById = async (req: Request, res: Response) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('userId', 'name email');
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.status(200).json(shop);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/shops — create shop (shopkeeper only)
export const createShop = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      shopName,
      category,
      description,
      address,
      deliveryRadius,
    } = req.body;

    if (!shopName || !category || !address?.coordinates) {
      return res.status(400).json({ message: 'shopName, category, and address.coordinates are required' });
    }

    const existing = await Shop.findOne({ userId });
    if (existing) {
      return res.status(400).json({ message: 'You already have a registered shop. Update it instead.' });
    }

    const shop = await Shop.create({
      userId,
      shopName,
      category,
      description,
      address: {
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        location: {
          type: 'Point',
          coordinates: address.coordinates, // [longitude, latitude]
        },
      },
      deliveryRadius: deliveryRadius || 5,
    });

    res.status(201).json(shop);
  } catch (error: any) {
    console.error('createShop error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/shops/:id — update shop
export const updateShop = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const shop = await Shop.findOne({ _id: req.params.id, userId });

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found or not authorized' });
    }

    const updates: any = { ...req.body };
    if (req.body.address?.coordinates) {
      updates['address.location'] = {
        type: 'Point',
        coordinates: req.body.address.coordinates,
      };
    }

    const updated = await Shop.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/shops/my — get logged-in shopkeeper's own shop
export const getMyShop = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const shop = await Shop.findOne({ userId });
    if (!shop) {
      return res.status(404).json({ message: 'No shop found for this user' });
    }
    res.status(200).json(shop);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
