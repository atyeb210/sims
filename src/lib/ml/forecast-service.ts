import * as tf from '@tensorflow/tfjs';
import { prisma } from '../prisma';

export interface ForecastResult {
  productId: string;
  locationId?: string;
  forecastDate: Date;
  predictedDemand: number;
  confidenceLower: number;
  confidenceUpper: number;
  accuracy?: number;
  modelUsed: string;
}

export interface ForecastConfig {
  productIds: string[];
  locationIds?: string[];
  forecastPeriod: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  horizonDays: number;
}

export class DemandForecastingService {
  private model: tf.LayersModel | null = null;
  private isModelLoaded = false;

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      // Create a simple LSTM model for time series forecasting
      this.model = tf.sequential({
        layers: [
          tf.layers.lstm({
            units: 50,
            returnSequences: true,
            inputShape: [7, 1], // 7 days of historical data, 1 feature
          }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.lstm({
            units: 50,
            returnSequences: false,
          }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 25 }),
          tf.layers.dense({ units: 1 }),
        ],
      });

      this.model.compile({
        optimizer: 'adam',
        loss: 'meanSquaredError',
        metrics: ['meanAbsoluteError'],
      });

      this.isModelLoaded = true;
      console.log('Demand forecasting model initialized successfully');
    } catch (error) {
      console.error('Failed to initialize forecasting model:', error);
      this.isModelLoaded = false;
    }
  }

  public async generateForecasts(config: ForecastConfig): Promise<ForecastResult[]> {
    const results: ForecastResult[] = [];

    for (const productId of config.productIds) {
      try {
        // If location IDs are specified, generate forecasts for each location
        if (config.locationIds && config.locationIds.length > 0) {
          for (const locationId of config.locationIds) {
            const forecast = await this.forecastForProductLocation(
              productId,
              locationId,
              config
            );
            if (forecast) {
              results.push(forecast);
            }
          }
        } else {
          // Generate aggregate forecast for the product across all locations
          const forecast = await this.forecastForProductLocation(
            productId,
            undefined,
            config
          );
          if (forecast) {
            results.push(forecast);
          }
        }
      } catch (error) {
        console.error(`Failed to generate forecast for product ${productId}:`, error);
      }
    }

    return results;
  }

  private async forecastForProductLocation(
    productId: string,
    locationId: string | undefined,
    config: ForecastConfig
  ): Promise<ForecastResult | null> {
    try {
      // Get historical sales data
      const historicalData = await this.getHistoricalSalesData(
        productId,
        locationId,
        config.forecastPeriod
      );

      if (historicalData.length < 7) {
        // Use simple moving average for products with limited history
        return this.generateSimpleMovingAverageForecast(
          productId,
          locationId,
          historicalData,
          config
        );
      }

      // Use ML model for products with sufficient history
      if (this.isModelLoaded && this.model) {
        return this.generateMLForecast(
          productId,
          locationId,
          historicalData,
          config
        );
      } else {
        // Fallback to statistical method
        return this.generateStatisticalForecast(
          productId,
          locationId,
          historicalData,
          config
        );
      }
    } catch (error) {
      console.error('Error in forecastForProductLocation:', error);
      return null;
    }
  }

  private async getHistoricalSalesData(
    productId: string,
    locationId: string | undefined,
    period: string
  ): Promise<{ date: Date; quantity: number }[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 60); // Get last 60 days

    const where: any = {
      productId,
      saleDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (locationId) {
      where.locationId = locationId;
    }

    const salesData = await prisma.salesData.findMany({
      where,
      orderBy: { saleDate: 'asc' },
    });

    // Group by date and sum quantities
    const groupedData = new Map<string, number>();
    salesData.forEach((sale: any) => {
      const dateKey = sale.saleDate.toISOString().split('T')[0];
      groupedData.set(dateKey, (groupedData.get(dateKey) || 0) + sale.quantity);
    });

    return Array.from(groupedData.entries()).map(([dateStr, quantity]) => ({
      date: new Date(dateStr),
      quantity,
    }));
  }

  private generateSimpleMovingAverageForecast(
    productId: string,
    locationId: string | undefined,
    historicalData: { date: Date; quantity: number }[],
    config: ForecastConfig
  ): ForecastResult {
    const avgDemand = historicalData.length > 0 
      ? historicalData.reduce((sum, data) => sum + data.quantity, 0) / historicalData.length
      : 1;

    // Apply seasonality adjustments for apparel
    const seasonalityFactor = this.getSeasonalityFactor(new Date(), config.forecastPeriod);
    const adjustedDemand = Math.round(avgDemand * seasonalityFactor);

    const forecastDate = new Date();
    forecastDate.setDate(forecastDate.getDate() + config.horizonDays);

    return {
      productId,
      locationId,
      forecastDate,
      predictedDemand: Math.max(0, adjustedDemand),
      confidenceLower: Math.max(0, Math.round(adjustedDemand * 0.7)),
      confidenceUpper: Math.round(adjustedDemand * 1.3),
      modelUsed: 'moving_average',
    };
  }

  private async generateMLForecast(
    productId: string,
    locationId: string | undefined,
    historicalData: { date: Date; quantity: number }[],
    config: ForecastConfig
  ): Promise<ForecastResult> {
    try {
      // Prepare data for the model
      const sequences = this.prepareSequenceData(historicalData);
      
      if (sequences.length === 0) {
        return this.generateSimpleMovingAverageForecast(
          productId,
          locationId,
          historicalData,
          config
        );
      }

      // Make prediction
      const input = tf.tensor3d([sequences[sequences.length - 1]], [1, 7, 1]);
      const prediction = this.model!.predict(input) as tf.Tensor;
      const predictionValue = await prediction.data();
      
      // Clean up tensors
      input.dispose();
      prediction.dispose();

      const predictedDemand = Math.max(0, Math.round(predictionValue[0]));
      const forecastDate = new Date();
      forecastDate.setDate(forecastDate.getDate() + config.horizonDays);

      return {
        productId,
        locationId,
        forecastDate,
        predictedDemand,
        confidenceLower: Math.max(0, Math.round(predictedDemand * 0.8)),
        confidenceUpper: Math.round(predictedDemand * 1.2),
        modelUsed: 'lstm_neural_network',
      };
    } catch (error) {
      console.error('Error in ML forecast:', error);
      return this.generateSimpleMovingAverageForecast(
        productId,
        locationId,
        historicalData,
        config
      );
    }
  }

  private generateStatisticalForecast(
    productId: string,
    locationId: string | undefined,
    historicalData: { date: Date; quantity: number }[],
    config: ForecastConfig
  ): ForecastResult {
    // Exponential smoothing forecast
    const alpha = 0.3; // Smoothing parameter
    let forecast = historicalData[0]?.quantity || 1;

    for (let i = 1; i < historicalData.length; i++) {
      forecast = alpha * historicalData[i].quantity + (1 - alpha) * forecast;
    }

    // Apply trend if detected
    if (historicalData.length >= 3) {
      const recentTrend = this.calculateTrend(historicalData.slice(-7));
      forecast += recentTrend;
    }

    const seasonalityFactor = this.getSeasonalityFactor(new Date(), config.forecastPeriod);
    const adjustedForecast = Math.max(0, Math.round(forecast * seasonalityFactor));

    const forecastDate = new Date();
    forecastDate.setDate(forecastDate.getDate() + config.horizonDays);

    return {
      productId,
      locationId,
      forecastDate,
      predictedDemand: adjustedForecast,
      confidenceLower: Math.max(0, Math.round(adjustedForecast * 0.75)),
      confidenceUpper: Math.round(adjustedForecast * 1.25),
      modelUsed: 'exponential_smoothing',
    };
  }

  private prepareSequenceData(historicalData: { date: Date; quantity: number }[]): number[][] {
    const sequences: number[][] = [];
    const sequenceLength = 7;

    if (historicalData.length < sequenceLength) {
      return sequences;
    }

    for (let i = sequenceLength; i < historicalData.length; i++) {
      const sequence = historicalData
        .slice(i - sequenceLength, i)
        .map(data => data.quantity);
      sequences.push(sequence);
    }

    return sequences;
  }

  private calculateTrend(data: { date: Date; quantity: number }[]): number {
    if (data.length < 2) return 0;

    const n = data.length;
    const sumX = data.reduce((sum, _, index) => sum + index, 0);
    const sumY = data.reduce((sum, item) => sum + item.quantity, 0);
    const sumXY = data.reduce((sum, item, index) => sum + index * item.quantity, 0);
    const sumX2 = data.reduce((sum, _, index) => sum + index * index, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return isNaN(slope) ? 0 : slope;
  }

  private getSeasonalityFactor(date: Date, period: string): number {
    const month = date.getMonth() + 1; // 1-12

    // Apparel seasonality patterns
    const seasonalFactors: { [key: number]: number } = {
      1: 0.8,  // January - post-holiday low
      2: 0.7,  // February - winter clearance
      3: 1.1,  // March - spring collections
      4: 1.2,  // April - spring peak
      5: 1.0,  // May - normal
      6: 0.9,  // June - early summer
      7: 0.8,  // July - summer sales
      8: 1.1,  // August - back-to-school
      9: 1.2,  // September - fall collections
      10: 1.3, // October - fall peak
      11: 1.4, // November - holiday shopping
      12: 1.2, // December - holiday peak
    };

    return seasonalFactors[month] || 1.0;
  }

  public async saveForecastResults(results: ForecastResult[]): Promise<void> {
    try {
      const forecastData = results.map(result => ({
        productId: result.productId,
        locationId: result.locationId,
        forecastDate: result.forecastDate,
        forecastPeriod: 'DAILY' as const,
        predictedDemand: result.predictedDemand,
        confidenceLower: result.confidenceLower,
        confidenceUpper: result.confidenceUpper,
        accuracy: result.accuracy,
        modelUsed: result.modelUsed,
      }));

      await prisma.demandForecast.createMany({
        data: forecastData,
      });

      console.log(`Saved ${results.length} forecast results to database`);
    } catch (error) {
      console.error('Error saving forecast results:', error);
      throw error;
    }
  }

  public async calculateForecastAccuracy(productId: string, days: number = 30): Promise<number> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      // Get historical forecasts
      const forecasts = await prisma.demandForecast.findMany({
        where: {
          productId,
          forecastDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      if (forecasts.length === 0) return 0;

      // Get actual sales for the same period
      const actualSales = await prisma.salesData.findMany({
        where: {
          productId,
          saleDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Group actual sales by date
      const actualByDate = new Map<string, number>();
      actualSales.forEach((sale: any) => {
        const dateKey = sale.saleDate.toISOString().split('T')[0];
        actualByDate.set(dateKey, (actualByDate.get(dateKey) || 0) + sale.quantity);
      });

      // Calculate accuracy
      let totalError = 0;
      let validForecasts = 0;

      forecasts.forEach((forecast: any) => {
        const dateKey = forecast.forecastDate.toISOString().split('T')[0];
        const actual = actualByDate.get(dateKey) || 0;
        const predicted = forecast.predictedDemand;

        if (actual > 0 || predicted > 0) {
          const error = Math.abs(actual - predicted) / Math.max(actual, predicted, 1);
          totalError += error;
          validForecasts++;
        }
      });

      return validForecasts > 0 ? Math.max(0, 1 - (totalError / validForecasts)) : 0;
    } catch (error) {
      console.error('Error calculating forecast accuracy:', error);
      return 0;
    }
  }
} 