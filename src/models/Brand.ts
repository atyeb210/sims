import mongoose from 'mongoose';

export interface IBrand extends mongoose.Document {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new mongoose.Schema<IBrand>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  logo: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  collection: 'brands'
});

export default mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema); 