const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Define schemas
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, collection: 'categories' });

const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  logo: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true, collection: 'brands' });

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['WAREHOUSE', 'STORE', 'DISTRIBUTION_CENTER', 'OUTLET'], required: true },
  address: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  phone: String,
  email: String,
  manager: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true, collection: 'locations' });

const ProductSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  parentSku: String,
  name: { type: String, required: true },
  description: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  season: { type: String, enum: ['SPRING_SUMMER', 'FALL_WINTER', 'RESORT', 'PRE_FALL', 'ALL_SEASON'], default: 'ALL_SEASON' },
  year: { type: Number, required: true },
  attributes: { type: mongoose.Schema.Types.Mixed, default: {} },
  unitCost: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  reorderLevel: { type: Number, default: 10 },
  maxStockLevel: Number,
  isActive: { type: Boolean, default: true },
}, { timestamps: true, collection: 'products' });

const InventoryLevelSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  quantity: { type: Number, default: 0 },
  reservedQuantity: { type: Number, default: 0 },
  availableQuantity: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true, collection: 'inventory_levels' });

const SalesDataSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  discount: Number,
  customerId: String,
  saleDate: { type: Date, required: true },
  salesChannel: { type: String, enum: ['IN_STORE', 'ONLINE', 'MARKETPLACE', 'WHOLESALE', 'MOBILE_APP'], required: true },
}, { timestamps: true, collection: 'sales_data' });

// Create models
const Category = mongoose.model('Category', CategorySchema);
const Brand = mongoose.model('Brand', BrandSchema);
const Location = mongoose.model('Location', LocationSchema);
const Product = mongoose.model('Product', ProductSchema);
const InventoryLevel = mongoose.model('InventoryLevel', InventoryLevelSchema);
const SalesData = mongoose.model('SalesData', SalesDataSchema);

async function seedDatabase() {
  try {
    // Clear existing data
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Location.deleteMany({});
    await Product.deleteMany({});
    await InventoryLevel.deleteMany({});
    await SalesData.deleteMany({});

    console.log('Cleared existing data');

    // Create Categories
    const categories = await Category.insertMany([
      { name: 'Clothing', description: 'All clothing items' },
      { name: 'Footwear', description: 'Shoes and accessories for feet' },
      { name: 'Accessories', description: 'Fashion accessories' },
      { name: 'Electronics', description: 'Electronic devices and gadgets' },
      { name: 'Home & Garden', description: 'Items for home and garden' },
    ]);

    const subcategories = await Category.insertMany([
      { name: 'T-Shirts', description: 'Casual t-shirts', parentId: categories[0]._id },
      { name: 'Jeans', description: 'Denim jeans', parentId: categories[0]._id },
      { name: 'Dresses', description: 'Women dresses', parentId: categories[0]._id },
      { name: 'Sneakers', description: 'Athletic sneakers', parentId: categories[1]._id },
      { name: 'Boots', description: 'Various types of boots', parentId: categories[1]._id },
      { name: 'Bags', description: 'Handbags and backpacks', parentId: categories[2]._id },
      { name: 'Watches', description: 'Timepieces', parentId: categories[2]._id },
    ]);

    console.log('Created categories');

    // Create Brands
    const brands = await Brand.insertMany([
      { name: 'Nike', description: 'Athletic wear and footwear' },
      { name: 'Adidas', description: 'Sports brand' },
      { name: 'Levi\'s', description: 'Denim and casual wear' },
      { name: 'H&M', description: 'Fast fashion retailer' },
      { name: 'Zara', description: 'Fashion retailer' },
      { name: 'Apple', description: 'Technology company' },
      { name: 'Samsung', description: 'Electronics manufacturer' },
    ]);

    console.log('Created brands');

    // Create Locations
    const locations = await Location.insertMany([
      {
        name: 'Main Warehouse',
        type: 'WAREHOUSE',
        address: '123 Storage Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      {
        name: 'NYC Flagship Store',
        type: 'STORE',
        address: '456 Fashion St',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        country: 'USA'
      },
      {
        name: 'LA Store',
        type: 'STORE',
        address: '789 Sunset Blvd',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA'
      },
      {
        name: 'Chicago Outlet',
        type: 'OUTLET',
        address: '321 Outlet Way',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA'
      },
    ]);

    console.log('Created locations');

    // Create Products
    const products = await Product.insertMany([
      {
        sku: 'NIKE-TS-001',
        name: 'Nike Classic T-Shirt',
        description: 'Comfortable cotton t-shirt',
        categoryId: subcategories[0]._id,
        brandId: brands[0]._id,
        season: 'ALL_SEASON',
        year: 2024,
        attributes: { color: 'Black', size: 'M', material: 'Cotton' },
        unitCost: 15.00,
        unitPrice: 29.99,
        reorderLevel: 20,
        maxStockLevel: 200
      },
      {
        sku: 'LEVIS-JN-501',
        name: 'Levi\'s 501 Original Jeans',
        description: 'Classic straight fit jeans',
        categoryId: subcategories[1]._id,
        brandId: brands[2]._id,
        season: 'ALL_SEASON',
        year: 2024,
        attributes: { color: 'Blue', size: '32x32', material: 'Denim' },
        unitCost: 35.00,
        unitPrice: 79.99,
        reorderLevel: 15,
        maxStockLevel: 150
      },
      {
        sku: 'NIKE-SN-001',
        name: 'Nike Air Force 1',
        description: 'Classic basketball sneaker',
        categoryId: subcategories[3]._id,
        brandId: brands[0]._id,
        season: 'ALL_SEASON',
        year: 2024,
        attributes: { color: 'White', size: '10', material: 'Leather' },
        unitCost: 60.00,
        unitPrice: 120.00,
        reorderLevel: 10,
        maxStockLevel: 100
      },
      {
        sku: 'HM-DR-001',
        name: 'H&M Summer Dress',
        description: 'Floral print summer dress',
        categoryId: subcategories[2]._id,
        brandId: brands[3]._id,
        season: 'SPRING_SUMMER',
        year: 2024,
        attributes: { color: 'Floral', size: 'S', material: 'Polyester' },
        unitCost: 20.00,
        unitPrice: 49.99,
        reorderLevel: 25,
        maxStockLevel: 180
      },
      {
        sku: 'ADIDAS-SN-001',
        name: 'Adidas Ultraboost',
        description: 'High-performance running shoe',
        categoryId: subcategories[3]._id,
        brandId: brands[1]._id,
        season: 'ALL_SEASON',
        year: 2024,
        attributes: { color: 'Black', size: '9', material: 'Knit' },
        unitCost: 80.00,
        unitPrice: 180.00,
        reorderLevel: 8,
        maxStockLevel: 80
      },
    ]);

    console.log('Created products');

    // Create Inventory Levels
    const inventoryLevels = [];
    for (const product of products) {
      for (const location of locations) {
        const quantity = Math.floor(Math.random() * 100) + 10;
        const reserved = Math.floor(Math.random() * 10);
        inventoryLevels.push({
          productId: product._id,
          locationId: location._id,
          quantity: quantity,
          reservedQuantity: reserved,
          availableQuantity: quantity - reserved,
          lastUpdated: new Date()
        });
      }
    }

    await InventoryLevel.insertMany(inventoryLevels);
    console.log('Created inventory levels');

    // Create Sales Data
    const salesData = [];
    const salesChannels = ['IN_STORE', 'ONLINE', 'MARKETPLACE', 'WHOLESALE', 'MOBILE_APP'];
    
    for (let i = 0; i < 100; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const saleDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
      
      salesData.push({
        productId: product._id,
        locationId: location._id,
        quantity: quantity,
        unitPrice: product.unitPrice,
        totalAmount: quantity * product.unitPrice,
        discount: Math.random() > 0.7 ? Math.floor(Math.random() * 20) + 5 : 0,
        customerId: `CUST-${Math.floor(Math.random() * 1000)}`,
        saleDate: saleDate,
        salesChannel: salesChannels[Math.floor(Math.random() * salesChannels.length)]
      });
    }

    await SalesData.insertMany(salesData);
    console.log('Created sales data');

    console.log('Database seeded successfully!');
    
    // Print summary
    console.log('\nSummary:');
    console.log(`Categories: ${await Category.countDocuments()}`);
    console.log(`Brands: ${await Brand.countDocuments()}`);
    console.log(`Locations: ${await Location.countDocuments()}`);
    console.log(`Products: ${await Product.countDocuments()}`);
    console.log(`Inventory Levels: ${await InventoryLevel.countDocuments()}`);
    console.log(`Sales Records: ${await SalesData.countDocuments()}`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding
connectDB().then(() => seedDatabase()); 