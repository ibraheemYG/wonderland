import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlistItem {
  productId: string;
  addedAt: Date;
}

export interface IWishlist extends Document {
  userId: string;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
      {
        productId: { type: String, required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
WishlistSchema.index({ userId: 1 });

export const Wishlist = mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);
