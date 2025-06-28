import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Category, Product } from '@/models';
import { withAuth, handleApiError } from '@/lib/middleware';
import { permissions, hasPermission } from '@/lib/auth';
import { categoryCreateSchema, paginationSchema } from '@/lib/validations';
import mongoose from 'mongoose';

// GET /api/categories - Get all categories with optional pagination
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

      const match = {
        isActive: true,
      };

      // Get categories with aggregation to include related data and counts
      const categories = await Category.aggregate([
        { $match: match },
        {
          $lookup: {
            from: 'categories',
            localField: 'parentId',
            foreignField: '_id',
            as: 'parent'
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: 'parentId',
            as: 'children'
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'categoryId',
            as: 'products',
            pipeline: [{ $match: { isActive: true } }]
          }
        },
        {
          $addFields: {
            parent: { $arrayElemAt: ['$parent', 0] },
            productCount: { $size: '$products' }
          }
        },
        { $sort: { name: 1 } },
        { $skip: (pagination.page - 1) * pagination.limit },
        { $limit: pagination.limit },
        { $project: { products: 0 } } // Remove products array to reduce payload
      ]);

      const totalItems = await Category.countDocuments(match);
      const totalPages = Math.ceil(totalItems / pagination.limit);

      // Build hierarchical structure for root categories
      const allCategories = await Category.find(match).lean();
      const rootCategories = categories.filter(cat => !cat.parentId);
      
      const categoryTree = rootCategories.map(category => ({
        id: category._id,
        name: category.name,
        description: category.description,
        parentId: category.parentId,
        isActive: category.isActive,
        parent: category.parent,
        productCount: category.productCount,
        children: category.children.map((child: any) => {
          const childProductCount = allCategories.find((c: any) => c._id.toString() === child._id.toString())?.productCount || 0;
          return {
            id: child._id,
            name: child.name,
            description: child.description,
            parentId: child.parentId,
            isActive: child.isActive,
            productCount: childProductCount,
          };
        }),
      }));

      // Format categories data
      const formattedCategories = categories.map(category => ({
        id: category._id,
        name: category.name,
        description: category.description,
        parentId: category.parentId,
        isActive: category.isActive,
        parent: category.parent,
        productCount: category.productCount,
        children: category.children.map((child: any) => ({
          id: child._id,
          name: child.name,
          description: child.description,
          parentId: child.parentId,
          isActive: child.isActive,
        })),
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      }));

      return NextResponse.json({
        success: true,
        data: formattedCategories,
        tree: categoryTree, // Hierarchical view
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

// POST /api/categories - Create a new category
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
      const validatedData = categoryCreateSchema.parse(body);

      // Check if category name already exists at the same level
      const existingCategory = await Category.findOne({
        name: validatedData.name,
        parentId: validatedData.parentId || null,
        isActive: true,
      });

      if (existingCategory) {
        return NextResponse.json(
          { error: 'Category with this name already exists at this level' },
          { status: 409 }
        );
      }

      // Verify parent category exists if specified
      if (validatedData.parentId) {
        if (!mongoose.Types.ObjectId.isValid(validatedData.parentId)) {
          return NextResponse.json(
            { error: 'Invalid parent category ID' },
            { status: 400 }
          );
        }

        const parentCategory = await Category.findById(validatedData.parentId);

        if (!parentCategory) {
          return NextResponse.json(
            { error: 'Parent category not found' },
            { status: 400 }
          );
        }
      }

      const category = await Category.create(validatedData);

      // Get the created category with related data
      const categoryWithDetails = await Category.aggregate([
        { $match: { _id: category._id } },
        {
          $lookup: {
            from: 'categories',
            localField: 'parentId',
            foreignField: '_id',
            as: 'parent'
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: 'parentId',
            as: 'children'
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'categoryId',
            as: 'products',
            pipeline: [{ $match: { isActive: true } }]
          }
        },
        {
          $addFields: {
            parent: { $arrayElemAt: ['$parent', 0] },
            productCount: { $size: '$products' }
          }
        },
        { $project: { products: 0 } }
      ]);

      const categoryData = categoryWithDetails[0];

      return NextResponse.json({
        success: true,
        data: {
          id: categoryData._id,
          name: categoryData.name,
          description: categoryData.description,
          parentId: categoryData.parentId,
          isActive: categoryData.isActive,
          parent: categoryData.parent,
          children: categoryData.children,
          productCount: categoryData.productCount,
          createdAt: categoryData.createdAt,
          updatedAt: categoryData.updatedAt,
        },
        message: 'Category created successfully',
      }, { status: 201 });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 