import mongoose from 'mongoose';

export enum LocationType {
  WAREHOUSE = 'WAREHOUSE',
  STORE = 'STORE',
  DISTRIBUTION_CENTER = 'DISTRIBUTION_CENTER',
  OUTLET = 'OUTLET'
}

export interface ILocation extends mongoose.Document {
  _id: string;
  name: string;
  type: LocationType;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  manager?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new mongoose.Schema<ILocation>({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(LocationType),
    required: true,
  },
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  zipCode: {
    type: String,
  },
  country: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  manager: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  collection: 'locations'
});

export default mongoose.models.Location || mongoose.model<ILocation>('Location', LocationSchema); 