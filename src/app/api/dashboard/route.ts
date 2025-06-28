import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Product, Location, Category, Brand, InventoryLevel, SalesData, Alert, DemandForecast } from '@/models';
import { withAuth, handleApiError } from '@/lib/middleware';
import { permissions, hasPermission } from '@/lib/auth';

// GET /api/dashboard - Get dashboard summary statistics
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
      
      // Default to last 30 days if no date range specified
      const endDate = params.endDate ? new Date(params.endDate) : new Date();
      const startDate = params.startDate ? new Date(params.startDate) : new Date();
      if (!params.startDate) {
        startDate.setDate(endDate.getDate() - 30);
      }

      // Get basic inventory metrics
      const [
        totalProducts,
        totalLocations,
        totalCategories,
        totalBrands,
        inventoryLevelsRaw,
        recentSalesRaw,
        activeAlertsRaw,
        recentForecastsRaw
      ] = await Promise.all([
        // Basic counts
        Product.countDocuments({ isActive: true }),
        Location.countDocuments({ isActive: true }),
        Category.countDocuments({ isActive: true }),
        Brand.countDocuments({ isActive: true }),

        // Inventory levels with product details using aggregation
        InventoryLevel.aggregate([
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
        ]),

        // Recent sales
        SalesData.aggregate([
          {
            $match: {
              saleDate: {
                $gte: startDate,
                $lte: endDate,
              },
            }
          },
          {
            $lookup: {
              from: 'products',
              localField: 'productId',
              foreignField: '_id',
              as: 'product'
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
        ]),

        // Active alerts
        Alert.aggregate([
          {
            $match: {
              isResolved: false,
            }
          },
          {
            $lookup: {
              from: 'products',
              localField: 'productId',
              foreignField: '_id',
              as: 'product'
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
          { $sort: { createdAt: -1 } }
        ]),

        // Recent forecasts
        DemandForecast.aggregate([
          {
            $match: {
              createdAt: {
                $gte: startDate,
                $lte: endDate,
              },
            }
          },
          {
            $lookup: {
              from: 'products',
              localField: 'productId',
              foreignField: '_id',
              as: 'product'
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
          { $limit: 10 }
        ]),
      ]);

      // Convert aggregation results to expected format
      const inventoryLevels = inventoryLevelsRaw;
      const recentSales = recentSalesRaw;
      const activeAlerts = activeAlertsRaw;
      const recentForecasts = recentForecastsRaw;

      // Calculate inventory metrics
      const totalInventoryValue = inventoryLevels.reduce(
        (sum: number, level: any) => sum + (level.availableQuantity * (level.product?.unitCost || 0)),
        0
      );

      const lowStockItems = inventoryLevels.filter(
        (level: any) => level.availableQuantity > 0 && level.product && level.availableQuantity <= level.product.reorderLevel
      );

      const outOfStockItems = inventoryLevels.filter(
        (level: any) => level.availableQuantity === 0
      );

      // Calculate sales metrics
      const totalSales = recentSales.reduce(
        (sum: number, sale: any) => sum + sale.totalAmount,
        0
      );

      const totalUnitsSold = recentSales.reduce(
        (sum: number, sale: any) => sum + sale.quantity,
        0
      );

      // Calculate top selling products
      const productSales = new Map();
      recentSales.forEach((sale: any) => {
        const productId = sale.productId.toString();
        const current = productSales.get(productId) || { quantity: 0, revenue: 0, product: sale.product };
        current.quantity += sale.quantity;
        current.revenue += sale.totalAmount;
        productSales.set(productId, current);
      });

      const topSellingProducts = Array.from(productSales.values())
        .sort((a: any, b: any) => b.quantity - a.quantity)
        .slice(0, 5)
        .map((item: any) => ({
          product: item.product,
          quantitySold: item.quantity,
          revenue: item.revenue,
        }));

      // Calculate inventory turnover (simplified)
      const averageInventoryValue = totalInventoryValue;
      const inventoryTurnover = averageInventoryValue > 0 ? totalSales / averageInventoryValue : 0;

      // Calculate forecast accuracy
      const forecastAccuracies = recentForecasts
        .filter((f: any) => f.accuracy !== null && f.accuracy !== undefined)
        .map((f: any) => f.accuracy || 0);
      
      const averageForecastAccuracy = forecastAccuracies.length > 0
        ? forecastAccuracies.reduce((sum: number, acc: number) => sum + acc, 0) / forecastAccuracies.length
        : 0;

      // Group alerts by type and severity
      const alertsByType = activeAlerts.reduce((acc: any, alert: any) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      }, {});

      const alertsBySeverity = activeAlerts.reduce((acc: any, alert: any) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      }, {});

      // Sales trend (last 7 days)
      const salesTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const daySales = recentSales.filter((sale: any) => 
          sale.saleDate >= dayStart && sale.saleDate < dayEnd
        );

        const dayRevenue = daySales.reduce((sum: number, sale: any) => sum + sale.totalAmount, 0);
        const dayUnits = daySales.reduce((sum: number, sale: any) => sum + sale.quantity, 0);

        salesTrend.push({
          date: dayStart.toISOString().split('T')[0],
          revenue: dayRevenue,
          units: dayUnits,
        });
      }

      // Category distribution
      const categoryDistribution = inventoryLevels.reduce((acc: any, level: any) => {
        const categoryName = level.product?.category?.name || 'Unknown';
        if (!acc[categoryName]) {
          acc[categoryName] = { count: 0, value: 0 };
        }
        acc[categoryName].count += level.availableQuantity;
        acc[categoryName].value += level.availableQuantity * (level.product?.unitCost || 0);
        return acc;
      }, {});

      // Location performance
      const locationPerformance = inventoryLevels.reduce((acc: any, level: any) => {
        const locationName = level.location?.name || 'Unknown';
        if (!acc[locationName]) {
          acc[locationName] = { 
            totalItems: 0, 
            totalValue: 0, 
            lowStockItems: 0, 
            outOfStockItems: 0 
          };
        }
        acc[locationName].totalItems += level.availableQuantity;
        acc[locationName].totalValue += level.availableQuantity * (level.product?.unitCost || 0);
        
        if (level.availableQuantity === 0) {
          acc[locationName].outOfStockItems += 1;
        } else if (level.product && level.availableQuantity <= level.product.reorderLevel) {
          acc[locationName].lowStockItems += 1;
        }
        
        return acc;
      }, {});

      const dashboardData = {
        overview: {
          totalProducts,
          totalLocations,
          totalCategories,
          totalBrands,
          totalInventoryValue,
          lowStockItemsCount: lowStockItems.length,
          outOfStockItemsCount: outOfStockItems.length,
          activeAlertsCount: activeAlerts.length,
        },
        sales: {
          totalSales,
          totalUnitsSold,
          inventoryTurnover,
          salesTrend,
          topSellingProducts,
        },
        inventory: {
          totalValue: totalInventoryValue,
          lowStockItems: lowStockItems.slice(0, 10).map((item: any) => ({
            id: item._id,
            product: item.product,
            location: item.location,
            availableQuantity: item.availableQuantity,
            reorderLevel: item.product?.reorderLevel || 0,
          })),
          outOfStockItems: outOfStockItems.slice(0, 10).map((item: any) => ({
            id: item._id,
            product: item.product,
            location: item.location,
            availableQuantity: item.availableQuantity,
          })),
          categoryDistribution,
          locationPerformance,
        },
        forecasting: {
          averageAccuracy: averageForecastAccuracy,
          recentForecasts: recentForecasts.slice(0, 5),
          totalForecasts: recentForecasts.length,
        },
        alerts: {
          total: activeAlerts.length,
          byType: alertsByType,
          bySeverity: alertsBySeverity,
          recent: activeAlerts.slice(0, 5),
        },
        activity: {
          recentSales: recentSales.slice(0, 5),
        },
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      };

      return NextResponse.json({
        success: true,
        data: dashboardData,
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 