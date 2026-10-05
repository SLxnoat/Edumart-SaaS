# Sprint 1 Remaining Tasks (Basic Catalog)

## ✅ Completed (User Foundation - Kushmi):
- User registration with email verification
- Secure login/logout with JWT
- Password hashing and security (bcryptjs)
- Profile viewing and editing
- Password reset functionality
- Role-based access control (student/tutor/admin)
- Email verification and welcome emails

## 📋 Remaining for Sprint 1 (Basic Catalog):

### 🗄️ Database Models:
- Product model (name, description, price, category, stock, images, createdBy)
- Category model (for product categorization)
- Review model (for product reviews/rating, related to product and user)

### 🛣️ API Routes:
- Product CRUD operations (with role-based access: admin/tutor can create/update/delete, student can read)
- Category management (admin/tutor only)
- Product search and filtering
- Review system (create, read, update, delete with appropriate permissions)

### 🔧 Features to Implement:
1. Product listing with pagination and sorting
2. Product search by name/category/description
3. Product filtering (price range, category, rating, date)
4. Add product (authenticated tutor/admin)
5. Update product (owner or admin/tutor)
6. Delete product (owner or admin/tutor)
7. Product reviews and ratings (authenticated users)
8. Basic image URL handling (to be enhanced with upload later)

### 🧩 Next Steps:
1. Create Product model in src/models/Product.js
2. Create Category model in src/models/Category.js
3. Create Review model in src/models/Review.js
4. Create Product controller in src/controllers/productController.js
5. Create Product routes in src/routes/products.js
6. Create Category controller and routes (if needed, or combine with product)
7. Create Review controller and routes
8. Update main routes to include product, category, and review routes
9. Implement basic CRUD operations with role-based middleware
10. Add search and filtering functionality
11. Create basic frontend catalog components (to be done by frontend team)

## 🎯 Sprint 1 Goal:
By end of Week 4, have:
- Complete user authentication system (DONE)
- Basic product catalog with listing, search, filtering, and basic CRUD (with roles)
- Foundation ready for cart/order implementation in Sprint 2

## 📝 Note:
The frontend team will work on integrating these APIs and building the UI concurrently.
