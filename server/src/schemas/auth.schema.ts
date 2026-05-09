import { z } from 'zod';

export const registerCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      coordinates: z.array(z.number()).length(2).optional(), // [lng, lat]
    }).optional()
  }),
});

export const registerShopkeeperSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Owner name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    shopName: z.string().min(2, 'Shop name is required'),
    category: z.string().min(2, 'Category is required'),
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      coordinates: z.array(z.number()).length(2), // [lng, lat] required for shops
    }),
    deliveryRadius: z.number().optional().default(5),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password is required'),
  }),
});
