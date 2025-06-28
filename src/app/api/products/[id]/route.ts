import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Product, Category, Brand, InventoryLevel } from '@/models';
import { withAuth, handleApiError } from '@/lib/middleware';
import { permissions, hasPermission } from '@/lib/auth';
import { productUpdateSchema } from '@/lib/validations';
import mongoose from 'mongoose';

// GET /api/products/[id] - Get a specific product
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(req, async (authenticatedReq) => {
    if (!hasPermission(authenticatedReq.user?.role || '', permissions.INVENTORY_READ)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    try {
      await connectDB();

      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return NextResponse.json(
          { error: 'Invalid product ID' },
          { status: 400 }
        );
      }

      const product = await Product.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(params.id) } },
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
        { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } }
      ]);

      if (!product || product.length === 0) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      const productData = product[0];

      // Calculate total stock
      const totalStock = productData.inventoryLevels.reduce(
        (sum: number, level: any) => sum + level.availableQuantity,
        0
      );

      const stockStatus = totalStock === 0 
        ? 'out_of_stock' 
        : totalStock <= productData.reorderLevel 
        ? 'low_stock' 
        : 'in_stock';

      return NextResponse.json({
        success: true,
        data: {
          id: productData._id,
          sku: productData.sku,
          name: productData.name,
          description: productData.description,
          category: productData.category,
          brand: productData.brand,
          season: productData.season,
          year: productData.year,
          attributes: productData.attributes,
          unitCost: productData.unitCost,
          unitPrice: productData.unitPrice,
          reorderLevel: productData.reorderLevel,
          maxStockLevel: productData.maxStockLevel,
          isActive: productData.isActive,
          createdAt: productData.createdAt,
          updatedAt: productData.updatedAt,
          inventoryLevels: productData.inventoryLevels,
          totalStock,
          stockStatus,
        },
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
}

// PUT /api/products/[id] - Update a specific product
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(req, async (authenticatedReq) => {
    if (!hasPermission(authenticatedReq.user?.role || '', permissions.PRODUCTS_MANAGE)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    try {
      await connectDB();

      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return NextResponse.json(
          { error: 'Invalid product ID' },
          { status: 400 }
        );
      }

      const body = await req.json();
      const validatedData = productUpdateSchema.parse(body);

      // Check if product exists
      const existingProduct = await Product.findById(params.id);

      if (!existingProduct) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      // If SKU is being updated, check if new SKU already exists
      if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
        const skuExists = await Product.findOne({ sku: validatedData.sku });

        if (skuExists) {
          return NextResponse.json(
            { error: 'Product with this SKU already exists' },
            { status: 409 }
          );
        }
      }

      // Verify category and brand exist if being updated
      if (validatedData.categoryId || validatedData.brandId) {
        const verifications = [];
        
        if (validatedData.categoryId) {
          verifications.push(Category.findById(validatedData.categoryId));
        }
        
        if (validatedData.brandId) {
          verifications.push(Brand.findById(validatedData.brandId));
        }

        const results = await Promise.all(verifications);
        
        if (validatedData.categoryId && !results[0]) {
          return NextResponse.json(
            { error: 'Category not found' },
            { status: 400 }
          );
        }
        
        if (validatedData.brandId && !results[validatedData.categoryId ? 1 : 0]) {
          return NextResponse.json(
            { error: 'Brand not found' },
            { status: 400 }
          );
        }
      }

      // Update the product
      const product = await Product.findByIdAndUpdate(
        params.id,
        validatedData,
        { new: true }
      ).populate(['categoryId', 'brandId']);

      return NextResponse.json({
        success: true,
        data: {
          id: product!._id,
          sku: product!.sku,
          name: product!.name,
          description: product!.description,
          category: product!.categoryId,
          brand: product!.brandId,
          season: product!.season,
          year: product!.year,
          attributes: product!.attributes,
          unitCost: product!.unitCost,
          unitPrice: product!.unitPrice,
          reorderLevel: product!.reorderLevel,
          maxStockLevel: product!.maxStockLevel,
          isActive: product!.isActive,
          createdAt: product!.createdAt,
          updatedAt: product!.updatedAt,
        },
        message: 'Product updated successfully',
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
}

// DELETE /api/products/[id] - Soft delete a specific product
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(req, async (authenticatedReq) => {
    if (!hasPermission(authenticatedReq.user?.role || '', permissions.PRODUCTS_MANAGE)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    try {
      await connectDB();

      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return NextResponse.json(
          { error: 'Invalid product ID' },
          { status: 400 }
        );
      }

      const product = await Product.findById(params.id);

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      // Check if product has inventory
      const inventoryLevels = await InventoryLevel.find({ productId: params.id });
      const hasInventory = inventoryLevels.some(level => level.quantity > 0);

      if (hasInventory) {
        return NextResponse.json(
          { error: 'Cannot delete product with existing inventory. Set as inactive instead.' },
          { status: 400 }
        );
      }

      // Soft delete by setting isActive to false
      const updatedProduct = await Product.findByIdAndUpdate(
        params.id,
        { isActive: false },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        data: {
          id: updatedProduct!._id,
          sku: updatedProduct!.sku,
          name: updatedProduct!.name,
          isActive: updatedProduct!.isActive,
          updatedAt: updatedProduct!.updatedAt,
        },
        message: 'Product deactivated successfully',
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 