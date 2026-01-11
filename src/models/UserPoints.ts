import mongoose, { Schema, Document } from 'mongoose';

export interface IPointTransaction {
  type: 'earned' | 'redeemed' | 'expired';
  points: number;
  description: string;
  orderId?: string;
  createdAt: Date;
}

export interface IUserPoints extends Document {
  userId: string;
  totalPoints: number;
  lifetimePoints: number;
  transactions: IPointTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

const UserPointsSchema = new Schema<IUserPoints>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    lifetimePoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    transactions: [
      {
        type: {
          type: String,
          enum: ['earned', 'redeemed', 'expired'],
          required: true,
        },
        points: { type: Number, required: true },
        description: { type: String, required: true },
        orderId: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index
UserPointsSchema.index({ userId: 1 }, { unique: true });

export const UserPoints = mongoose.models.UserPoints || mongoose.model<IUserPoints>('UserPoints', UserPointsSchema);
