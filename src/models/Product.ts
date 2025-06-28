import mongoose from 'mongoose';

export enum Season {
  SPRING_SUMMER = 'SPRING_SUMMER',
  FALL_WINTER = 'FALL_WINTER',
  RESORT = 'RESORT',
  PRE_FALL = 'PRE_FALL',
  ALL_SEASON = 'ALL_SEASON'
}

export interface IProduct extends mongoose.Document {
  _id: string;
  sku: string;
  parentSku?: string;
  name: string;
  description?: string;
  categoryId: mongoose.Types.ObjectId;
  brandId: mongoose.Types.ObjectId;
  season: Season;
  year: number;
  attributes: any; // Color, size, material, style, gender, ageGroup
  unitCost: number;
  unitPrice: number;
  reorderLevel: number;
  maxStockLevel?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new mongoose.Schema<IProduct>({
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  parentSku: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  season: {
    type: String,
    enum: Object.values(Season),
    default: Season.ALL_SEASON,
  },
  year: {
    type: Number,
    required: true,
  },
  attributes: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  unitCost: {
    type: Number,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  reorderLevel: {
    type: Number,
    default: 10,
  },
  maxStockLevel: {
    type: Number,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  collection: 'products'
});

// Create indexes for better performance
ProductSchema.index({ sku: 1 });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ brandId: 1 });
ProductSchema.index({ isActive: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema); 