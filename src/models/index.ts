// Export all MongoDB models
export { default as User, IUser, UserRole } from './User';
export { default as Category, ICategory } from './Category';
export { default as Brand, IBrand } from './Brand';
export { default as Location, ILocation, LocationType } from './Location';
export { default as Product, IProduct, Season } from './Product';
export { default as InventoryLevel, IInventoryLevel } from './InventoryLevel';
export { default as SalesData, ISalesData, SalesChannel } from './SalesData';
export { default as Alert, IAlert, AlertType, AlertSeverity } from './Alert';
export { default as DemandForecast, IDemandForecast, ForecastPeriod } from './DemandForecast';

// Database connection
export { default as connectDB } from '../lib/mongodb'; 