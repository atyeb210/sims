import mongoose from 'mongoose';

export interface IInventoryLevel extends mongoose.Document {
  _id: string;
  productId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number; // Computed: quantity - reservedQuantity
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryLevelSchema = new mongoose.Schema<IInventoryLevel>({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  },
  quantity: {
    type: Number,
    default: 0,
  },
  reservedQuantity: {
    type: Number,
    default: 0,
  },
  availableQuantity: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'inventory_levels'
});

// Create compound unique index for productId and locationId
InventoryLevelSchema.index({ productId: 1, locationId: 1 }, { unique: true });

// Pre-save middleware to calculate available quantity
InventoryLevelSchema.pre('save', function(next) {
  this.availableQuantity = this.quantity - this.reservedQuantity;
  this.lastUpdated = new Date();
  next();
});

export default mongoose.models.InventoryLevel || mongoose.model<IInventoryLevel>('InventoryLevel', InventoryLevelSchema); 