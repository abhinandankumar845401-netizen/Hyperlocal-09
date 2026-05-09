import mongoose, { Schema } from 'mongoose';
import type { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: 'customer' | 'shopkeeper' | 'admin';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    location: {
      type: string;
      coordinates: number[]; // [longitude, latitude]
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: {
      type: String,
      enum: ['customer', 'shopkeeper', 'admin'],
      default: 'customer',
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      location: {
        type: { type: String, enum: ['Point'] },
        coordinates: { type: [Number] },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Sparse 2dsphere index — only indexes users who have location coordinates
UserSchema.index({ 'address.location': '2dsphere' }, { sparse: true });

export default mongoose.model<IUser>('User', UserSchema);
