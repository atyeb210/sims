import mongoose from 'mongoose';

export enum ForecastPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY'
}

export interface IDemandForecast extends mongoose.Document {
  _id: string;
  productId: mongoose.Types.ObjectId;
  locationId?: mongoose.Types.ObjectId;
  forecastDate: Date;
  forecastPeriod: ForecastPeriod;
  predictedDemand: number;
  confidenceLower: number;
  confidenceUpper: number;
  accuracy?: number;
  modelUsed: string;
  modelVersion?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DemandForecastSchema = new mongoose.Schema<IDemandForecast>({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
  },
  forecastDate: {
    type: Date,
    required: true,
  },
  forecastPeriod: {
    type: String,
    enum: Object.values(ForecastPeriod),
    required: true,
  },
  predictedDemand: {
    type: Number,
    required: true,
  },
  confidenceLower: {
    type: Number,
    required: true,
  },
  confidenceUpper: {
    type: Number,
    required: true,
  },
  accuracy: {
    type: Number,
  },
  modelUsed: {
    type: String,
    required: true,
  },
  modelVersion: {
    type: String,
  },
}, {
  timestamps: true,
  collection: 'demand_forecasts'
});

// Create indexes for better performance
DemandForecastSchema.index({ productId: 1 });
DemandForecastSchema.index({ locationId: 1 });
DemandForecastSchema.index({ forecastDate: 1 });
DemandForecastSchema.index({ modelUsed: 1 });

export default mongoose.models.DemandForecast || mongoose.model<IDemandForecast>('DemandForecast', DemandForecastSchema); 