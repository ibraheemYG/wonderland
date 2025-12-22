import mongoose, { Schema, Document } from 'mongoose';

export interface IDimensions {
  width?: number;
  height?: number;
  depth?: number;
  unit?: 'cm' | 'inch';
}

// أبعاد قطع غرفة النوم
export interface IBedroomPieces {
  bed?: IDimensions;           // السرير
  wardrobe?: IDimensions;      // الخزانة
  nightstand?: IDimensions;    // الكومودينو
  dresser?: IDimensions;       // التسريحة
  desk?: IDimensions;          // الميز/المكتب
  mirror?: IDimensions;        // المرآة
}

export interface IProduct extends Document {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  images?: string[];
  mainImageIndex?: number;
  videos?: string[];
  threeD?: string;
  sketchfabId?: string; // معرف نموذج Sketchfab
  category: 'living-room' | 'bedroom' | 'kitchen' | 'bathroom' | 'decor' | 'appliances' | 'sale' | 'furnishings';
  description?: string;
  descriptionAlign?: 'right' | 'left' | 'center'; // محاذاة الوصف
  rating?: number;
  originalPrice?: number;
  isCustom?: boolean;
  dimensions?: IDimensions;
  bedroomPieces?: IBedroomPieces; // أبعاد قطع غرفة النوم
  weight?: number;
  material?: string;
  color?: string;
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
    sketchfabId: {
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
    descriptionAlign: {
      type: String,
      enum: ['right', 'left', 'center'],
      default: 'right',
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
    dimensions: {
      width: { type: Number },
      height: { type: Number },
      depth: { type: Number },
      unit: { type: String, enum: ['cm', 'inch'], default: 'cm' },
    },
    bedroomPieces: {
      bed: {
        width: { type: Number },
        height: { type: Number },
        depth: { type: Number },
        unit: { type: String, enum: ['cm', 'inch'], default: 'cm' },
      },
      wardrobe: {
        width: { type: Number },
        height: { type: Number },
        depth: { type: Number },
        unit: { type: String, enum: ['cm', 'inch'], default: 'cm' },
      },
      nightstand: {
        width: { type: Number },
        height: { type: Number },
        depth: { type: Number },
        unit: { type: String, enum: ['cm', 'inch'], default: 'cm' },
      },
      dresser: {
        width: { type: Number },
        height: { type: Number },
        depth: { type: Number },
        unit: { type: String, enum: ['cm', 'inch'], default: 'cm' },
      },
      desk: {
        width: { type: Number },
        height: { type: Number },
        depth: { type: Number },
        unit: { type: String, enum: ['cm', 'inch'], default: 'cm' },
      },
      mirror: {
        width: { type: Number },
        height: { type: Number },
        depth: { type: Number },
        unit: { type: String, enum: ['cm', 'inch'], default: 'cm' },
      },
    },
    weight: {
      type: Number,
    },
    material: {
      type: String,
    },
    color: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// إضافة indexes لتسريع الاستعلامات
ProductSchema.index({ category: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ id: 1 }, { unique: true });
ProductSchema.index({ category: 1, createdAt: -1 });

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
