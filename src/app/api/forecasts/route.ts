import { NextRequest, NextResponse } from 'next/server';
import { connectDB, DemandForecast, Product, Location } from '@/models';
import { withAuth, handleApiError } from '@/lib/middleware';
import { permissions, hasPermission } from '@/lib/auth';
import { forecastRequestSchema, paginationSchema } from '@/lib/validations';
import { DemandForecastingService } from '@/lib/ml/forecast-service';
import mongoose from 'mongoose';

// GET /api/forecasts - Get existing forecasts with filters
export async function GET(req: NextRequest) {
  return withAuth(req, async (authenticatedReq) => {
    if (!hasPermission(authenticatedReq.user?.role || '', permissions.FORECASTS_VIEW)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    try {
      await connectDB();
      
      const { searchParams } = new URL(req.url);
      const params = Object.fromEntries(searchParams.entries());
      
      const pagination = paginationSchema.parse(params);

      const match: any = {};

      // Apply filters
      if (params.productId) {
        if (mongoose.Types.ObjectId.isValid(params.productId)) {
          match.productId = new mongoose.Types.ObjectId(params.productId);
        }
      }

      if (params.locationId) {
        if (mongoose.Types.ObjectId.isValid(params.locationId)) {
          match.locationId = new mongoose.Types.ObjectId(params.locationId);
        }
      }

      if (params.modelUsed) {
        match.modelUsed = params.modelUsed;
      }

      if (params.startDate && params.endDate) {
        match.forecastDate = {
          $gte: new Date(params.startDate),
          $lte: new Date(params.endDate),
        };
      }

      const totalItems = await DemandForecast.countDocuments(match);

      const forecasts = await DemandForecast.aggregate([
        { $match: match },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product',
            pipeline: [
              {
                $lookup: {
                  from: 'categories',
                  localField: 'categoryId',
                  foreignField: '_id',
                  as: 'category'
                }
              },
              {
                $lookup: {
                  from: 'brands',
                  localField: 'brandId',
                  foreignField: '_id',
                  as: 'brand'
                }
              },
              {
                $addFields: {
                  category: { $arrayElemAt: ['$category', 0] },
                  brand: { $arrayElemAt: ['$brand', 0] }
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: 'locations',
            localField: 'locationId',
            foreignField: '_id',
            as: 'location'
          }
        },
        {
          $addFields: {
            product: { $arrayElemAt: ['$product', 0] },
            location: { $arrayElemAt: ['$location', 0] }
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: (pagination.page - 1) * pagination.limit },
        { $limit: pagination.limit }
      ]);

      const totalPages = Math.ceil(totalItems / pagination.limit);

      // Calculate summary statistics
      const summary = {
        totalForecasts: totalItems,
        averageAccuracy: forecasts.reduce((sum: number, f: any) => 
          sum + (f.accuracy || 0), 0) / Math.max(forecasts.length, 1),
        modelDistribution: {} as Record<string, number>,
      };

      // Group by model type
      forecasts.forEach((forecast: any) => {
        summary.modelDistribution[forecast.modelUsed] = 
          (summary.modelDistribution[forecast.modelUsed] || 0) + 1;
      });

      // Format the forecasts data
      const formattedForecasts = forecasts.map((forecast: any) => ({
        id: forecast._id,
        productId: forecast.productId,
        locationId: forecast.locationId,
        forecastDate: forecast.forecastDate,
        forecastPeriod: forecast.forecastPeriod,
        predictedDemand: forecast.predictedDemand,
        confidenceLower: forecast.confidenceLower,
        confidenceUpper: forecast.confidenceUpper,
        accuracy: forecast.accuracy,
        modelUsed: forecast.modelUsed,
        modelVersion: forecast.modelVersion,
        createdAt: forecast.createdAt,
        updatedAt: forecast.updatedAt,
        product: forecast.product ? {
          id: forecast.product._id,
          sku: forecast.product.sku,
          name: forecast.product.name,
          category: forecast.product.category,
          brand: forecast.product.brand,
        } : null,
        location: forecast.location ? {
          id: forecast.location._id,
          name: forecast.location.name,
          type: forecast.location.type,
        } : null,
      }));

      return NextResponse.json({
        success: true,
        data: formattedForecasts,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          totalItems,
          totalPages,
          hasNext: pagination.page < totalPages,
          hasPrevious: pagination.page > 1,
        },
        summary,
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
}

// POST /api/forecasts - Generate new forecasts
export async function POST(req: NextRequest) {
  return withAuth(req, async (authenticatedReq) => {
    if (!hasPermission(authenticatedReq.user?.role || '', permissions.FORECASTS_MANAGE)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    try {
      await connectDB();
      
      const body = await req.json();
      const validatedData = forecastRequestSchema.parse(body);

      // Convert string IDs to ObjectIds and validate
      const productObjectIds = validatedData.productIds.map(id => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error(`Invalid product ID: ${id}`);
        }
        return new mongoose.Types.ObjectId(id);
      });

      // Verify products exist
      const products = await Product.find({
        _id: { $in: productObjectIds },
        isActive: true,
      });

      if (products.length !== validatedData.productIds.length) {
        return NextResponse.json(
          { error: 'One or more products not found or inactive' },
          { status: 400 }
        );
      }

      // Verify locations exist if specified
      if (validatedData.locationIds && validatedData.locationIds.length > 0) {
        const locationObjectIds = validatedData.locationIds.map(id => {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(`Invalid location ID: ${id}`);
          }
          return new mongoose.Types.ObjectId(id);
        });

        const locations = await Location.find({
          _id: { $in: locationObjectIds },
          isActive: true,
        });

        if (locations.length !== validatedData.locationIds.length) {
          return NextResponse.json(
            { error: 'One or more locations not found or inactive' },
            { status: 400 }
          );
        }
      }

      // Initialize forecasting service
      const forecastingService = new DemandForecastingService();

      // Generate forecasts
      const forecastResults = await forecastingService.generateForecasts({
        productIds: validatedData.productIds,
        locationIds: validatedData.locationIds,
        forecastPeriod: validatedData.forecastPeriod,
        horizonDays: validatedData.horizonDays,
      });

      // Save results to database
      await forecastingService.saveForecastResults(forecastResults);

      // Calculate accuracy for products with historical data
      const accuracyPromises = validatedData.productIds.map(async (productId) => {
        try {
          const accuracy = await forecastingService.calculateForecastAccuracy(productId);
          return { productId, accuracy };
        } catch (error) {
          return { productId, accuracy: 0 };
        }
      });

      const accuracyResults = await Promise.all(accuracyPromises);

      return NextResponse.json({
        success: true,
        data: {
          forecastCount: forecastResults.length,
          forecasts: forecastResults,
          accuracy: accuracyResults,
        },
        message: `Generated ${forecastResults.length} forecasts successfully`,
      }, { status: 201 });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 