import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Product, Category, Brand, InventoryLevel } from '@/models';
import { withAuth, validateRequestBody, handleApiError } from '@/lib/middleware';
import { permissions, hasPermission } from '@/lib/auth';
import { 
  productCreateSchema, 
  paginationSchema, 
  productFiltersSchema 
} from '@/lib/validations';
import mongoose from 'mongoose';

// GET /api/products - Get all products with filters and pagination
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
      const filters = productFiltersSchema.parse(params);

      const match: any = {
        isActive: filters.isActive ?? true,
      };

      // Apply search filter
      if (filters.search) {
        match.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { sku: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
        ];
      }

      // Apply category filter
      if (filters.categoryId) {
        match.categoryId = new mongoose.Types.ObjectId(filters.categoryId);
      }

      // Apply brand filter
      if (filters.brandId) {
        match.brandId = new mongoose.Types.ObjectId(filters.brandId);
      }

      // Apply season filter
      if (filters.season) {
        match.season = filters.season;
      }

      // Apply price range filters
      if (filters.minPrice || filters.maxPrice) {
        match.unitPrice = {};
        if (filters.minPrice) match.unitPrice.$gte = filters.minPrice;
        if (filters.maxPrice) match.unitPrice.$lte = filters.maxPrice;
      }

      // Calculate total count
      const totalItems = await Product.countDocuments(match);

      // Fetch products with aggregation to include related data
      const products = await Product.aggregate([
        { $match: match },
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
          $lookup: {
            from: 'inventory_levels',
            localField: '_id',
            foreignField: 'productId',
            as: 'inventoryLevels',
            pipeline: [
              {
                $lookup: {
                  from: 'locations',
                  localField: 'locationId',
                  foreignField: '_id',
                  as: 'location'
                }
              },
              { $unwind: '$location' }
            ]
          }
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
        { $sort: { createdAt: -1 } },
        { $skip: (pagination.page - 1) * pagination.limit },
        { $limit: pagination.limit }
      ]);

      // Calculate stock status for each product
      const productsWithStock = products.map((product: any) => {
        const totalStock = product.inventoryLevels.reduce(
          (sum: number, level: any) => sum + level.availableQuantity,
          0
        );
        
        const stockStatus = totalStock === 0 
          ? 'out_of_stock' 
          : totalStock <= product.reorderLevel 
          ? 'low_stock' 
          : 'in_stock';

        return {
          id: product._id,
          sku: product.sku,
          name: product.name,
          description: product.description,
          category: product.category,
          brand: product.brand,
          season: product.season,
          year: product.year,
          attributes: product.attributes,
          unitCost: product.unitCost,
          unitPrice: product.unitPrice,
          reorderLevel: product.reorderLevel,
          maxStockLevel: product.maxStockLevel,
          isActive: product.isActive,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          totalStock,
          stockStatus,
          inventoryLevels: product.inventoryLevels,
        };
      });

      // Apply stock filters if specified
      let filteredProducts = productsWithStock;
      if (filters.lowStock) {
        filteredProducts = filteredProducts.filter((p: any) => p.stockStatus === 'low_stock');
      }
      if (filters.outOfStock) {
        filteredProducts = filteredProducts.filter((p: any) => p.stockStatus === 'out_of_stock');
      }

      const totalPages = Math.ceil(totalItems / pagination.limit);

      return NextResponse.json({
        success: true,
        data: filteredProducts,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          totalItems,
          totalPages,
          hasNext: pagination.page < totalPages,
          hasPrevious: pagination.page > 1,
        },
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
}

// POST /api/products - Create a new product
export async function POST(req: NextRequest) {
  return withAuth(req, async (authenticatedReq) => {
    if (!hasPermission(authenticatedReq.user?.role || '', permissions.PRODUCTS_MANAGE)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    try {
      await connectDB();
      
      const body = await req.json();
      const validatedData = productCreateSchema.parse(body);

      // Check if SKU already exists
      const existingProduct = await Product.findOne({ sku: validatedData.sku });

      if (existingProduct) {
        return NextResponse.json(
          { error: 'Product with this SKU already exists' },
          { status: 409 }
        );
      }

      // Verify category and brand exist
      const [category, brand] = await Promise.all([
        Category.findById(validatedData.categoryId),
        Brand.findById(validatedData.brandId),
      ]);

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 400 }
        );
      }

      if (!brand) {
        return NextResponse.json(
          { error: 'Brand not found' },
          { status: 400 }
        );
      }

      // Create the product
      const product = await Product.create({
        sku: validatedData.sku,
        parentSku: validatedData.parentSku,
        name: validatedData.name,
        description: validatedData.description,
        categoryId: validatedData.categoryId,
        brandId: validatedData.brandId,
        season: validatedData.season,
        year: validatedData.year,
        attributes: validatedData.attributes || {},
        unitCost: validatedData.unitCost,
        unitPrice: validatedData.unitPrice,
        reorderLevel: validatedData.reorderLevel,
        maxStockLevel: validatedData.maxStockLevel,
      });

      // Populate the created product with category and brand details
      await product.populate(['categoryId', 'brandId']);

      return NextResponse.json({
        success: true,
        data: {
          id: product._id,
          sku: product.sku,
          name: product.name,
          description: product.description,
          category: category,
          brand: brand,
          season: product.season,
          year: product.year,
          attributes: product.attributes,
          unitCost: product.unitCost,
          unitPrice: product.unitPrice,
          reorderLevel: product.reorderLevel,
          maxStockLevel: product.maxStockLevel,
          isActive: product.isActive,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
        message: 'Product created successfully',
      }, { status: 201 });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 