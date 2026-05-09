import mongoose, { Schema } from 'mongoose';
import type { Document } from 'mongoose';

export interface IShop extends Document {
  userId: mongoose.Types.ObjectId;
  shopName: string;
  category: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    location: {
      type: string;
      coordinates: number[]; // [longitude, latitude]
    };
  };
  deliveryRadius: number; // in kilometers
  trustScore: number;
  isVerified: boolean;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shopName: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
      },
    },
    deliveryRadius: { type: Number, default: 5 },
    trustScore: { type: Number, default: 50 }, // out of 100
    isVerified: { type: Boolean, default: false },
    isOpen: { type: Boolean, default: true },
    businessHours: { type: String, default: '9:00 AM - 9:00 PM' },
    images: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for finding nearby shops
ShopSchema.index({ 'address.location': '2dsphere' });

export default mongoose.model<IShop>('Shop', ShopSchema);
