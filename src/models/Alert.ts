import mongoose from 'mongoose';

export enum AlertType {
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  OVERSTOCK = 'OVERSTOCK',
  REORDER_POINT = 'REORDER_POINT',
  EXPIRY_WARNING = 'EXPIRY_WARNING',
  PRICE_CHANGE = 'PRICE_CHANGE',
  FORECAST_DEVIATION = 'FORECAST_DEVIATION'
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface IAlert extends mongoose.Document {
  _id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  productId?: mongoose.Types.ObjectId;
  locationId?: mongoose.Types.ObjectId;
  data?: any;
  isRead: boolean;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new mongoose.Schema<IAlert>({
  type: {
    type: String,
    enum: Object.values(AlertType),
    required: true,
  },
  severity: {
    type: String,
    enum: Object.values(AlertSeverity),
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  isResolved: {
    type: Boolean,
    default: false,
  },
  resolvedAt: {
    type: Date,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
  collection: 'alerts'
});

// Create indexes for better performance
AlertSchema.index({ type: 1 });
AlertSchema.index({ severity: 1 });
AlertSchema.index({ isRead: 1 });
AlertSchema.index({ isResolved: 1 });
AlertSchema.index({ productId: 1 });
AlertSchema.index({ locationId: 1 });

export default mongoose.models.Alert || mongoose.model<IAlert>('Alert', AlertSchema); 