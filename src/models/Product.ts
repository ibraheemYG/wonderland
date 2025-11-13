import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  images?: string[];
  mainImageIndex?: number;
  videos?: string[];
  threeD?: string;
  category: 'living-room' | 'bedroom' | 'kitchen' | 'bathroom' | 'decor' | 'appliances' | 'sale' | 'furnishings';
  description?: string;
  rating?: number;
  originalPrice?: number;
  isCustom?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    images: {
      type: [String],
      default: [],
    },
    mainImageIndex: {
      type: Number,
      default: 0,
    },
    videos: {
      type: [String],
      default: [],
    },
    threeD: {
      type: String,
    },
    category: {
      type: String,
      enum: ['living-room', 'bedroom', 'kitchen', 'bathroom', 'decor', 'appliances', 'sale', 'furnishings'],
      required: true,
    },
    description: {
      type: String,
    },
    rating: {
      type: Number,
    },
    originalPrice: {
      type: Number,
    },
    isCustom: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
