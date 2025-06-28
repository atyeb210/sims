import { NextRequest, NextResponse } from 'next/server';
import { connectDB, InventoryLevel, Product, Location, Alert } from '@/models';
import { withAuth, handleApiError } from '@/lib/middleware';
import { permissions, hasPermission } from '@/lib/auth';
import { 
  inventoryLevelUpdateSchema,
  inventoryBulkUpdateSchema,
  paginationSchema,
  inventoryFiltersSchema 
} from '@/lib/validations';
import mongoose from 'mongoose';

// GET /api/inventory - Get inventory levels with filters and pagination
export async function GET(req: NextRequest) {
  return withAuth(req, async (authenticatedReq) => {
    if (!hasPermission(authenticatedReq.user?.role || '', permissions.INVENTORY_READ)) {
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
      const filters = inventoryFiltersSchema.parse(params);

      const match: any = {};

      // Apply location filter
      if (filters.locationId) {
        if (mongoose.Types.ObjectId.isValid(filters.locationId)) {
          match.locationId = new mongoose.Types.ObjectId(filters.locationId);
        }
      }

      // Build aggregation pipeline
      const pipeline: any[] = [
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
        }
      ];

      // Apply product search filter
      if (filters.search) {
        pipeline.push({
          $match: {
            $or: [
              { 'product.name': { $regex: filters.search, $options: 'i' } },
              { 'product.sku': { $regex: filters.search, $options: 'i' } }
            ]
          }
        });
      }

      // Apply category filter
      if (filters.categoryId) {
        if (mongoose.Types.ObjectId.isValid(filters.categoryId)) {
          pipeline.push({
            $match: {
              'product.categoryId': new mongoose.Types.ObjectId(filters.categoryId)
            }
          });
        }
      }

      // Apply brand filter
      if (filters.brandId) {
        if (mongoose.Types.ObjectId.isValid(filters.brandId)) {
          pipeline.push({
            $match: {
              'product.brandId': new mongoose.Types.ObjectId(filters.brandId)
            }
          });
        }
      }

      // Get total count
      const countPipeline = [...pipeline, { $count: 'total' }];
      const countResult = await InventoryLevel.aggregate(countPipeline);
      const totalItems = countResult[0]?.total || 0;

      // Add pagination and sorting
      pipeline.push(
        { $sort: { lastUpdated: -1 } },
        { $skip: (pagination.page - 1) * pagination.limit },
        { $limit: pagination.limit }
      );

      const inventoryLevels = await InventoryLevel.aggregate(pipeline);

      // Add stock status and alerts
      const levelsWithStatus = inventoryLevels.map((level: any) => {
        const stockStatus = level.availableQuantity === 0 
          ? 'out_of_stock' 
          : level.availableQuantity <= level.product.reorderLevel 
          ? 'low_stock' 
          : 'in_stock';

        const needsReorder = level.availableQuantity <= level.product.reorderLevel;
        const daysOfStock = level.availableQuantity > 0 && level.product.reorderLevel > 0 
          ? Math.floor(level.availableQuantity / (level.product.reorderLevel / 30)) 
          : 0;

        return {
          id: level._id,
          productId: level.productId,
          locationId: level.locationId,
          quantity: level.quantity,
          reservedQuantity: level.reservedQuantity,
          availableQuantity: level.availableQuantity,
          lastUpdated: level.lastUpdated,
          product: level.product ? {
            id: level.product._id,
            sku: level.product.sku,
            name: level.product.name,
            reorderLevel: level.product.reorderLevel,
            unitCost: level.product.unitCost,
            unitPrice: level.product.unitPrice,
            category: level.product.category,
            brand: level.product.brand,
          } : null,
          location: level.location ? {
            id: level.location._id,
            name: level.location.name,
            type: level.location.type,
          } : null,
          stockStatus,
          needsReorder,
          daysOfStock,
        };
      });

      // Apply stock status filters
      let filteredLevels = levelsWithStatus;
      if (filters.lowStock) {
        filteredLevels = filteredLevels.filter((l: any) => l.stockStatus === 'low_stock');
      }
      if (filters.outOfStock) {
        filteredLevels = filteredLevels.filter((l: any) => l.stockStatus === 'out_of_stock');
      }

      const totalPages = Math.ceil(totalItems / pagination.limit);

      return NextResponse.json({
        success: true,
        data: filteredLevels,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          totalItems,
          totalPages,
          hasNext: pagination.page < totalPages,
          hasPrevious: pagination.page > 1,
        },
        summary: {
          totalItems: filteredLevels.length,
          lowStockItems: filteredLevels.filter((l: any) => l.stockStatus === 'low_stock').length,
          outOfStockItems: filteredLevels.filter((l: any) => l.stockStatus === 'out_of_stock').length,
          totalValue: filteredLevels.reduce((sum: number, l: any) => 
            sum + (l.availableQuantity * (l.product?.unitCost || 0)), 0
          ),
        },
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
}

// POST /api/inventory - Update single inventory level
export async function POST(req: NextRequest) {
  return withAuth(req, async (authenticatedReq) => {
    if (!hasPermission(authenticatedReq.user?.role || '', permissions.INVENTORY_WRITE)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    try {
      await connectDB();
      
      const body = await req.json();
      const validatedData = inventoryLevelUpdateSchema.parse(body);

      // Validate ObjectIds
      if (!mongoose.Types.ObjectId.isValid(validatedData.productId) || 
          !mongoose.Types.ObjectId.isValid(validatedData.locationId)) {
        return NextResponse.json(
          { error: 'Invalid product or location ID' },
          { status: 400 }
        );
      }

      // Verify product and location exist
      const [product, location] = await Promise.all([
        Product.findById(validatedData.productId),
        Location.findById(validatedData.locationId),
      ]);

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 400 }
        );
      }

      if (!location) {
        return NextResponse.json(
          { error: 'Location not found' },
          { status: 400 }
        );
      }

      // Calculate available quantity
      const availableQuantity = validatedData.quantity - validatedData.reservedQuantity;

      // Use findOneAndUpdate with upsert to create or update inventory level
      const inventoryLevel = await InventoryLevel.findOneAndUpdate(
        {
          productId: validatedData.productId,
          locationId: validatedData.locationId,
        },
        {
          quantity: validatedData.quantity,
          reservedQuantity: validatedData.reservedQuantity,
          availableQuantity,
          lastUpdated: new Date(),
        },
        {
          upsert: true,
          new: true
        }
      );

      // Check if low stock alert needs to be created
      if (availableQuantity <= product.reorderLevel && availableQuantity > 0) {
        const existingAlert = await Alert.findOne({
          type: 'LOW_STOCK',
          productId: validatedData.productId,
          locationId: validatedData.locationId,
          isResolved: false,
        });

        if (!existingAlert) {
          await Alert.create({
            type: 'LOW_STOCK',
            severity: 'MEDIUM',
            title: `Low Stock Alert: ${product.name}`,
            message: `Stock level (${availableQuantity}) is below reorder point (${product.reorderLevel})`,
            productId: validatedData.productId,
            locationId: validatedData.locationId,
            data: {
              currentStock: availableQuantity,
              reorderLevel: product.reorderLevel,
            },
          });
        }
      }

      // Check if out of stock alert needs to be created
      if (availableQuantity === 0) {
        const existingAlert = await Alert.findOne({
          type: 'OUT_OF_STOCK',
          productId: validatedData.productId,
          locationId: validatedData.locationId,
          isResolved: false,
        });

        if (!existingAlert) {
          await Alert.create({
            type: 'OUT_OF_STOCK',
            severity: 'HIGH',
            title: `Out of Stock: ${product.name}`,
            message: `Product is completely out of stock at ${location.name}`,
            productId: validatedData.productId,
            locationId: validatedData.locationId,
          });
        }
      }

      // Populate the result with product and location details
      const populatedLevel = await InventoryLevel.findById(inventoryLevel._id)
        .populate({
          path: 'productId',
          populate: [
            { path: 'categoryId' },
            { path: 'brandId' }
          ]
        })
        .populate('locationId');

      return NextResponse.json({
        success: true,
        data: {
          id: populatedLevel!._id,
          productId: populatedLevel!.productId,
          locationId: populatedLevel!.locationId,
          quantity: populatedLevel!.quantity,
          reservedQuantity: populatedLevel!.reservedQuantity,
          availableQuantity: populatedLevel!.availableQuantity,
          lastUpdated: populatedLevel!.lastUpdated,
          product: populatedLevel!.productId,
          location: populatedLevel!.locationId,
        },
        message: 'Inventory level updated successfully',
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
}

// PUT /api/inventory - Bulk update inventory levels
export async function PUT(req: NextRequest) {
  return withAuth(req, async (authenticatedReq) => {
    if (!hasPermission(authenticatedReq.user?.role || '', permissions.INVENTORY_WRITE)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    try {
      await connectDB();
      
      const body = await req.json();
      const validatedData = inventoryBulkUpdateSchema.parse(body);

      const results = [];
      const errors = [];

      // Process each update
      for (const update of validatedData.updates) {
        try {
          // Validate ObjectIds
          if (!mongoose.Types.ObjectId.isValid(update.productId) || 
              !mongoose.Types.ObjectId.isValid(update.locationId)) {
            errors.push({
              productId: update.productId,
              locationId: update.locationId,
              error: 'Invalid product or location ID',
            });
            continue;
          }

          // Verify product and location exist
          const [product, location] = await Promise.all([
            Product.findById(update.productId),
            Location.findById(update.locationId),
          ]);

          if (!product || !location) {
            errors.push({
              productId: update.productId,
              locationId: update.locationId,
              error: 'Product or location not found',
            });
            continue;
          }

          const availableQuantity = update.quantity - update.reservedQuantity;

          const inventoryLevel = await InventoryLevel.findOneAndUpdate(
            {
              productId: update.productId,
              locationId: update.locationId,
            },
            {
              quantity: update.quantity,
              reservedQuantity: update.reservedQuantity,
              availableQuantity,
              lastUpdated: new Date(),
            },
            {
              upsert: true,
              new: true
            }
          );

          results.push({
            id: inventoryLevel._id,
            productId: inventoryLevel.productId,
            locationId: inventoryLevel.locationId,
            quantity: inventoryLevel.quantity,
            reservedQuantity: inventoryLevel.reservedQuantity,
            availableQuantity: inventoryLevel.availableQuantity,
          });

        } catch (error) {
          errors.push({
            productId: update.productId,
            locationId: update.locationId,
            error: 'Failed to update inventory level',
          });
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          updated: results.length,
          errorCount: errors.length,
          results,
          errors,
        },
        message: `Bulk update completed: ${results.length} successful, ${errors.length} failed`,
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 