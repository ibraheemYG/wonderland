import mongoose, { Schema, Document } from 'mongoose';

export interface ISurvey extends Document {
  userId?: string;
  userName?: string;
  email: string;
  preferences: {
    categories: string[];
    styles: string[];
    colors: string[];
  };
  budget?: string;
  timeline?: string;
  additionalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SurveySchema = new Schema<ISurvey>(
  {
    userId: String,
    userName: String,
    email: {
      type: String,
      required: true,
    },
    preferences: {
      categories: [String],
      styles: [String],
      colors: [String],
    },
    budget: String,
    timeline: String,
    additionalNotes: String,
  },
  { timestamps: true }
);

export const Survey = mongoose.models.Survey || mongoose.model<ISurvey>('Survey', SurveySchema);
