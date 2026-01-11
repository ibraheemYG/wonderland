import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number; // 1-5
  comment: string;
  images?: string[]; // صور المراجعة
  isVerifiedPurchase?: boolean; // هل اشترى المنتج فعلاً
  helpfulCount?: number; // عدد الأشخاص الذين وجدوا المراجعة مفيدة
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    images: {
      type: [String],
      default: [],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// فهرس مركب لمنع التقييم المكرر من نفس المستخدم لنفس المنتج
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
