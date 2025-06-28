import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Brand } from '@/models';
import { withAuth, handleApiError } from '@/lib/middleware';
import { permissions, hasPermission } from '@/lib/auth';
import { brandCreateSchema, paginationSchema } from '@/lib/validations';

// GET /api/brands - Get all brands with optional pagination
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
      const search = params.search;

      const match: any = {
        isActive: true,
      };

      if (search) {
        match.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const brands = await Brand.aggregate([
        { $match: match },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'brandId',
            as: 'products',
            pipeline: [{ $match: { isActive: true } }]
          }
        },
        {
          $addFields: {
            productCount: { $size: '$products' }
          }
        },
        { $sort: { name: 1 } },
        { $skip: (pagination.page - 1) * pagination.limit },
        { $limit: pagination.limit },
        { $project: { products: 0 } } // Remove products array to reduce payload
      ]);

      const totalItems = await Brand.countDocuments(match);
      const totalPages = Math.ceil(totalItems / pagination.limit);

      const brandsWithStats = brands.map((brand: any) => ({
        id: brand._id,
        name: brand.name,
        description: brand.description,
        logo: brand.logo,
        isActive: brand.isActive,
        productCount: brand.productCount,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt,
      }));

      return NextResponse.json({
        success: true,
        data: brandsWithStats,
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

// POST /api/brands - Create a new brand
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
      const validatedData = brandCreateSchema.parse(body);

      // Check if brand name already exists
      const existingBrand = await Brand.findOne({
        name: validatedData.name,
        isActive: true,
      });

      if (existingBrand) {
        return NextResponse.json(
          { error: 'Brand with this name already exists' },
          { status: 409 }
        );
      }

      const brand = await Brand.create(validatedData);

      // Get brand with product count
      const brandWithStats = await Brand.aggregate([
        { $match: { _id: brand._id } },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'brandId',
            as: 'products',
            pipeline: [{ $match: { isActive: true } }]
          }
        },
        {
          $addFields: {
            productCount: { $size: '$products' }
          }
        },
        { $project: { products: 0 } }
      ]);

      const brandData = brandWithStats[0];

      return NextResponse.json({
        success: true,
        data: {
          id: brandData._id,
          name: brandData.name,
          description: brandData.description,
          logo: brandData.logo,
          isActive: brandData.isActive,
          productCount: brandData.productCount,
          createdAt: brandData.createdAt,
          updatedAt: brandData.updatedAt,
        },
        message: 'Brand created successfully',
      }, { status: 201 });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 