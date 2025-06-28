import mongoose from 'mongoose';

export enum SalesChannel {
  IN_STORE = 'IN_STORE',
  ONLINE = 'ONLINE',
  MARKETPLACE = 'MARKETPLACE',
  WHOLESALE = 'WHOLESALE',
  MOBILE_APP = 'MOBILE_APP'
}

export interface ISalesData extends mongoose.Document {
  _id: string;
  productId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  discount?: number;
  customerId?: string;
  saleDate: Date;
  salesChannel: SalesChannel;
  createdAt: Date;
  updatedAt: Date;
}

const SalesDataSchema = new mongoose.Schema<ISalesData>({
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
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
  },
  customerId: {
    type: String,
  },
  saleDate: {
    type: Date,
    required: true,
  },
  salesChannel: {
    type: String,
    enum: Object.values(SalesChannel),
    required: true,
  },
}, {
  timestamps: true,
  collection: 'sales_data'
});

// Create indexes for better performance
SalesDataSchema.index({ productId: 1 });
SalesDataSchema.index({ locationId: 1 });
SalesDataSchema.index({ saleDate: 1 });
SalesDataSchema.index({ salesChannel: 1 });

export default mongoose.models.SalesData || mongoose.model<ISalesData>('SalesData', SalesDataSchema); 