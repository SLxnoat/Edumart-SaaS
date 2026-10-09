# EduMart UI Implementation Wiring Checklist

This document tracks the implementation status of all UI screens and components outlined in the wireframes.md document. It serves as a checklist for development progress and helps ensure all user flows are properly wired together.

## Legend
- [ ] Not Started
- [ ] In Progress
- [ ] Completed
- [ ] Needs Review
- [ ] Blocked

## 1. User Authentication Flow (Kushmi)

### 1.1 Landing/Homepage
- [x] HomePage component implemented in App.jsx
- [ ] Enhance with featured categories and recommendations (per wireframes)
- [ ] Add responsive behavior for mobile/tablet/desktop
- [ ] Wire up "Explore catalog" and "Become a seller" CTA buttons

### 1.2 Login/Register Modal/Page
- [x] Login.jsx exists
- [x] Register.jsx exists
- [x] Enhance Login page per wireframes (social login, forgot password link)
- [x] Enhance Register page per wireframes (role selection: Student/Tutor/Admin)
- [x] Add form validation and error states
- [x] Wire up to authentication API endpoints

### 1.3 Email Verification Flow
- [x] VerifyEmail.jsx exists
- [x] Enhance UI per wireframes (success/error states, resend option)
- [x] Wire up to email verification API endpoint

### 1.4 Password Reset Flow
- [x] ForgotPassword.jsx exists
- [x] ResetPassword.jsx exists
- [ ] Enhance UI per wireframes (email input, token validation, password strength)
- [ ] Wire up to password reset API endpoints
- [ ] Add success/error states and redirect after reset

### 1.5 Profile View/Edit Page
- [x] ProfilePage exists
- [x] Enhance to show user details, orders, saved items (per wireframes)
- [x] Implement edit functionality for profile information
- [x] Wire up to user profile API endpoints
- [x] Add role-based views (student/tutor/admin)

### 1.6 Role Selection During Registration
- [x] Implement role selection (Student/Tutor/Admin) in Register.jsx
- [x] Wire role selection to backend registration API
- [x] Add role-specific onboarding flows

## 2. Product Discovery Flow (Vidula)

### 2.1 Homepage with Featured Categories and Recommendations
- [x] Enhance HomePage.jsx to show featured categories (basic implementation)
- [ ] Add recommendation section (personalized/popular items)
- [x] Wire up to category and product API endpoints
- [x] Implement loading states and error handling

### 2.2 Category Browsing Page
- [x] Create CategoryPage component (basic implementation with mock data)
- [x] Design UI for category grid/list view (per wireframes)
- [x] Implement category navigation and filtering
- [x] Wire up to category API endpoints
- [x] Add breadcrumb navigation (Home / Catalog / Category)

### 2.3 Search Results Page with Filters
- [x] Enhanced CatalogPage.jsx with basic search functionality
- [x] Create SearchResultsPage component (basic implementation with mock data)
- [x] Add filter sidebar (subject, grade, exam year, format, price range)
- [x] Implement sort options (relevance, price-low, price-high, rating, newest)
- [ ] Add grid/list view toggle
- [x] Wire up to search API endpoint
- [x] Implement pagination or infinite scroll (Load more & pagination)
- [x] Add "no results" state

### 2.4 Product Listing/Grid View
- [x] Create ProductCard component (reusable)
- [x] Implement product grid layout (per wireframes)
- [x] Add product badges (new, sale, featured)
- [x] Wire up product data to cards
- [x] Implement hover states and quick actions

### 2.5 Product Detail Page
- [x] Create ProductDetailPage component (basic implementation with mock data)
- [x] Design layout: image gallery, description, pricing, reviews (per wireframes)
- [x] Add image zoom/switch functionality
- [x] Implement "Add to cart" and "Save for later" buttons
- [x] Add quantity selector with validation
- [x] Wire up to product detail API endpoint
- [x] Add related products section
- [ ] Implement review display and submission form
- [x] Add seller information and ratings
- [x] Implement SEO-friendly URLs (/product/:id or /product/:slug)

### 2.6 Related Products Section
- [x] Create RelatedProducts component (basic implementation with mock data)
- [x] Implement algorithm for related products (same category, similar tags)
- [x] Wire up to related products API endpoint
- [x] Design UI per wireframes (horizontal scroll or grid)

### 2.7 Save for Later/Wishlist Functionality
- [x] Add wishlist button to ProductCard and ProductDetailPage
- [x] Create WishlistPage component (basic implementation with mock data)
- [x] Implement add/remove from wishlist functionality
- [x] Wire up to wishlist API endpoints
- [ ] Add wishlist count indicator in header

## 3. Shopping Cart & Checkout Flow (Bhanuka & Charuka)

### 3.1 Mini Cart (Accessible from Header)
- [x] Create MiniCart component in header
- [x] Implement cart item count and preview
- [x] Add cart dropdown on hover/click
- [x] Wire up to cart API for real-time updates
- [x] Implement "View Cart" and "Checkout" buttons

### 3.2 Full Cart Page
- [x] CartPage exists (basic)
- [ ] Enhance CartPage per wireframes:
  - Item list with edit/delete options
  - Quantity selector with validation
  - Price breakdown (subtotal, tax, shipping, discount)
  - Coupon code field
  - Save for later/wishlist options
  - Estimated shipping/delivery dates
- [ ] Wire up to cart API endpoints (get, update, remove items)
- [ ] Implement cart persistence (local storage or backend)
- [ ] Add empty cart state with shopping suggestions

### 3.3 Checkout Flow (Multi-Step)
#### Step 1: Cart Review
- [ ] Create CheckoutStep1 component (Cart Review)
- [ ] Display cart items with editable quantities
- [ ] Show price breakdown
- [ ] Apply coupon validation
- [ ] Wire "Continue to Shipping" button

#### Step 2: Shipping Information (for Physical Items)
- [ ] Create CheckoutStep2 component (Shipping Info)
- [ ] Implement shipping address form
- [ ] Add address book/saved addresses
- [ ] Implement shipping method selection
- [ ] Wire up to shipping calculation API
- [ ] Wire "Continue to Payment" button

#### Step 3: Payment Method Selection
- [ ] Create CheckoutStep3 component (Payment Method)
- [ ] Implement payment method options (card, digital wallet, etc.)
- [ ] Add saved payment methods
- [ ] Wire up to payment method API endpoints
- [ ] Wire "Continue to Review" button

#### Step 4: Order Review and Confirmation
- [ ] Create CheckoutStep4 component (Order Review)
- [ ] Display order summary with all details
- [ ] Show final price breakdown
- [ ] Implement terms and conditions checkbox
- [ ] Wire "Place Order" button to payment processing

### 3.4 Order Confirmation Page
- [x] Create OrderConfirmationPage component
- [x] Display order number and details
- [x] Show estimated delivery date
- [x] Provide actions: Track order, Continue shopping, View order history
- [x] Wire up to order confirmation API endpoint
- [ ] Add social sharing options

### 3.5 Order History Page
- [x] Create OrderHistoryPage component
- [x] Implement order list with filtering (status, date)
- [x] Add pagination or infinite scroll
- [x] Wire up to order history API endpoint
- [x] Implement order status badges
- [ ] Add reorder/cancel options (where applicable)

### 3.6 Order Detail Page
- [ ] Create OrderDetailPage component
- [ ] Design layout: order info, items, shipping, payment details (per wireframes)
- [ ] Add tracking information and delivery updates
- [ ] Implement contact seller/support buttons
- [ ] Wire up to order detail API endpoint
- [ ] Add download invoice/receipt options

### 3.7 Payment Processing
#### 3.7.1 Payment Form
- [ ] Create PaymentForm component
- [ ] Implement credit card form (with validation)
- [ ] Add digital wallet options (Apple Pay, Google Pay, etc.)
- [ ] Wire up to payment processing API endpoint
- [ ] Implement error handling and validation messages

#### 3.7.2 Payment Processing Modal/Spinner
- [ ] Create PaymentProcessing component (modal/spinner)
- [ ] Show during payment authorization
- [ ] Implement cancel option (if applicable)
- [ ] Wire up to payment status polling

#### 3.7.3 Payment Success/Error States
- [ ] Create PaymentSuccess component
- [ ] Create PaymentError component
- [ ] Implement appropriate messaging and next steps
- [ ] Wire up to payment result handling

#### 3.7.4 3D Secure Authentication Flow (if applicable)
- [ ] Implement 3DS redirect/iframe handling
- [ ] Add authentication challenge screen
- [ ] Wire up to 3DS verification API
- [ ] Handle success/cancel/timeout scenarios

## 4. Payment Processing (Charuka) - See also Checkout Flow above
- [x] Integrate with Stripe/PayPal API via backend
- [x] Implement webhook handling for payment events
- [x] Implement 3D Secure 2.0 authentication handling
- [x] Payment processing modal with spinner and error/success states
- [ ] Add refund/cancellation UI in order details
- [ ] Implement payment method management (add/remove cards)
- [ ] Add payment history page for users

## 5. Seller Dashboard Flow (Malki & Charuka)
- [x] Seller Dashboard Flow (Complete: 6/6 pages implemented, wired to /api/seller endpoints, styled and tested)

### 5.1 Seller Dashboard Overview
- [x] Create SellerDashboardPage component (connected to live /api/seller/dashboard API)
- [x] Implement overview widgets: sales, pending orders, performance (per wireframes)
- [x] Add quick action buttons: Add product, View orders, Check earnings
- [x] Wire up to seller dashboard API endpoints
- [x] Implement date range filtering & live stats

### 5.2 Product Upload/Create Flow (Multi-Step)
#### Step 1: Basic Information
- [x] Create ProductUploadStep1 component
- [x] Implement form: title, description, price, category
- [x] Add preview of how product will appear
- [x] Wire "Next" button to validation

#### Step 2: File Upload
- [x] Create ProductUploadStep2 component
- [x] Implement file upload area (drag & drop or click)
- [x] Add file type/size validation
- [x] Show upload progress and file badge
- [x] Wire "Next" button after upload completion

#### Step 3: Categorization
- [x] Create ProductUploadStep3 component
- [x] Implement taxonomy selection: subject, grade, exam year, format
- [x] Wire "Preview" button

#### Step 4: Preview and Submit
- [x] Create ProductUploadStep4 component
- [x] Display product preview as it will appear live
- [x] Implement final validation
- [x] Wire "Publish Product" button to API
- [x] Add success state with manage product link

### 5.3 Product Management Page
- [x] Create SellerProductsPage component
- [x] Implement product list with filtering (status, category, search)
- [x] Add actions: activate/deactivate, delete
- [x] Show product performance metrics (views, price, format)
- [x] Wire up to seller products API endpoints

### 5.4 Order Management for Sellers
- [x] Create SellerOrdersPage component
- [x] Implement order list with filtering (pending, completed, paid)
- [x] Show order details and customer info
- [x] Wire up to seller orders API endpoints

### 5.5 Earnings and Payouts Page
- [x] Create SellerEarningsPage component
- [x] Implement earnings overview: gross sales, platform fee (10%), available payout
- [x] Implement payout request functionality
- [x] Wire up to earnings & payout API endpoints

### 5.6 Sales Analytics and Reporting
- [x] Create SellerAnalyticsPage component
- [x] Implement charts: monthly revenue trend, popularity by subject
- [x] Wire up to analytics API endpoints

## 6. Admin Dashboard Flow (Malki)

### 6.1 Admin Dashboard Overview
- [x] Create AdminDashboardPage component (basic implementation with mock data)
- [ ] Implement overview widgets: key metrics, alerts, recent activity
- [ ] Add quick links to management sections
- [ ] Wire up to admin dashboard API endpoints
- [ ] Implement real-time updates (if applicable)
- [ ] Add system health/status indicators

### 6.2 User Management
- [ ] Create AdminUsersPage component
- [ ] Implement user list with filtering (role, status, date)
- [ ] Add search functionality
- [ ] Show user details and activity
- [ ] Implement role management (assign/change roles)
- [ ] Wire up to user management API endpoints
- [ ] Add user activation/deactivation
- [ ] Add impersonation feature (for support)
- [ ] Add bulk actions (email, notify, etc.)

### 6.3 Product Moderation Queue
- [ ] Create AdminModerationQueue component
- [ ] Implement product list pending approval
- [ ] Show product preview and seller info
- [ ] Add moderation actions: approve, reject, request changes
- [ ] Implement rejection/feedback form
- [ ] Wire up to product moderation API endpoints
- [ ] Add bulk moderation options
- [ ] Add moderation history/logs

### 6.4 Order Management
- [ ] Create AdminOrdersPage component
- [ ] Implement order list with filtering (status, date, amount)
- [ ] Add search by order number, user email, etc.
- [ ] Show detailed order information
- [ ] Implement order status management
- [ ] Wire up to admin orders API endpoints
- [ ] Add fraud detection flags
- [ ] Add refund/cancellation management
- [ ] Add export/print functionality

### 6.5 Review Moderation Tools
- [ ] Create AdminReviewsPage component
- [ ] Implement review list pending moderation
- [ ] Show review content and product info
- [ ] Add moderation actions: approve, reject
- [ ] Implement response capability (for admin/system)
- [ ] Wire up to review moderation API endpoints
- [ ] Add helpfulness voting tracking
- [ ] Add review analytics (sentiment, topics)

### 6.6 Notification/Campaign Management
- [ ] Create AdminNotificationsPage component
- [ ] Implement notification creation form
- [ ] Add targeting options (user roles, segments)
- [ ] Implement scheduling and delivery options
- [ ] Wire up to notification API endpoints
- [ ] Add notification history and analytics
- [ ] Add A/B testing capabilities
- [ ] Add template management

### 6.7 System Settings and Configuration
- [ ] Create AdminSettingsPage component
- [ ] Implement settings sections: general, payment, email, security
- [ ] Add form fields with validation
- [ ] Implement save/reset functionality
- [ ] Wire up to settings API endpoints
- [ ] Add backup/restore options
- [ ] Add API key management
- [ ] Add integration settings (third-party services)

## 7. Review & Rating System (Malki)

### 7.1 Product Review Display (on Product Detail Page)
- [ ] Enhance ProductDetailPage to show reviews
- [ ] Implement review list with sorting (newest, highest rating, helpful)
- [ ] Show reviewer info and rating
- [ ] Add review text and helpfulness voting
- [ ] Implement seller response display
- [ ] Add review photos/gallery display
- [ ] Wire up to product reviews API endpoint

### 7.2 Review Submission Form
- [ ] Create ReviewForm component
- [ ] Implement rating selector (stars)
- [ ] Add title and comment fields
- [ ] Allow photo upload (multiple)
- [ ] Implement character limits and validation
- [ ] Wire up to review submission API endpoint
- [ ] Add success/error states
- [ ] Add anonymous review option (if applicable)
- [ ] Add review guidelines/display requirements

### 7.3 Helpful Voting System
- [ ] Implement helpful/unhelpful buttons on reviews
- [ ] Show vote count and update in real-time
- [ ] Wire up to helpfulness voting API endpoint
- [ ] Implement voting restrictions (once per user per review)
- [ ] Add vote undo functionality

### 7.4 Review Response Capability (for Sellers)
- [ ] Add "Respond to review" button for sellers
- [ ] Implement response form/text area
- [ ] Wire up to review response API endpoint
- [ ] Show seller responses on review display
- [ ] Implement response editing/deletion (within time limit)
- [ ] Add notification to reviewer when seller responds

### 7.5 Moderated Review Display
- [ ] Ensure only approved reviews are shown publicly
- [ ] Implement moderation states: pending, approved, rejected
- [ ] Add moderation indicators for admins/sellers
- [ ] Wire up to moderation status API
- [ ] Add appeal process for rejected reviews

### 7.6 User Reviews Management Page
- [x] Create ReviewsPage component (basic implementation with mock data)
- [ ] Display list of user's reviews with product info, rating, title, comment
- [ ] Allow editing and deleting own reviews
- [ ] Wire up to user reviews API endpoint (e.g., /api/user/reviews)
- [ ] Add button to write a new review (navigate to product or review form)
- [ ] Implement helpful voting on own reviews (optional)
- [ ] Add loading, error, and empty states

## 8. AI Chatbot Flow (Kushmi & Charuka)

### 8.1 Chat Widget (Collapsible, Persistent)
- [x] Chatbot.jsx exists (basic implementation)
- [ ] Enhance to be collapsible/minimizable
- [ ] Add persistent positioning (bottom right)
- [ ] Implement open/close animation
- [ ] Add widget state persistence (local storage)
- [ ] Wire up to show/hide based on user triggers

### 8.2 Chat Conversation View
- [x] Basic chat view exists in Chatbot.jsx
- [ ] Enhance UI per wireframes (message bubbles, avatars, timestamps)
- [ ] Add message status indicators (sent, delivered, read)
- [ ] Implement typing indicators for both users
- [ ] Add scroll-to-bottom functionality
- [ ] Add message timestamps and date separators

### 8.3 Suggested Quick Replies/FAQ Buttons
- [ ] Add suggested questions on chat open
- [ ] Implement dynamic suggestions based on context/page
- [ ] Add FAQ button that shows common questions
- [ ] Wire up to get suggestions API endpoint
- [ ] Implement suggestion click handling

### 8.4 Message Status (Sent, Delivered, Read)
- [ ] Enhance message objects with status fields
- [ ] Implement status updates from backend
- [ ] Add visual indicators for each status
- [ ] Wire up to message status API endpoint
- [ ] Add read receipts functionality

### 8.5 Feedback/Rating After Conversation
- [ ] Add feedback request after conversation ends
- [ ] Implement rating selector (thumbs up/down or stars)
- [ ] Add optional feedback text field
- [ ] Wire up to chat feedback API endpoint
- [ ] Add thank you message after feedback
- [ ] Implement feedback analytics

## 9. Notification System (Malki)

### 9.1 Notification Center/Bell Icon
- [ ] Create NotificationBell component in header
- [ ] Implement badge with unread count
- [ ] Add click to open notification dropdown
- [ ] Wire up to get unread count API endpoint
- [ ] Implement bell animation for new notifications
- [ ] Add hover tooltip showing preview

### 9.2 Notification Dropdown/List
- [x] Create NotificationDropdown component (basic implementation with mock data)
- [x] Implement notification list with pagination (basic)
- [x] Show notification icon/type, title, timestamp
- [x] Add mark as read/delete options
- [ ] Implement grouping/batching of similar notifications
- [x] Wire up to get notifications API endpoint (mock)
- [x] Add "View all" and "Mark all as read" buttons
- [x] Add empty state with suggestions

### 9.3 Individual Notification Detail View
- [ ] Create NotificationDetailPage component
- [ ] Implement full view of notification content
- [ ] Show related object (order, product, etc.) with link
- [ ] Add actions based on notification type (View order, Reply message, etc.)
- [ ] Wire up to notification detail API endpoint
- [ ] Implement auto-mark as read on view
- [ ] Add sharing/copy link functionality

### 9.4 Notification Preferences/Settings
- [ ] Create NotificationSettingsPage component
- [ ] Implement preference toggles by type (orders, messages, promotions, etc.)
- [ ] Add delivery method options (email, in-app, push)
- [ ] Add frequency settings (instant, daily digest, weekly)
- [ ] Wire up to notification preferences API endpoint
- [ ] Add preview/test notification functionality
- [ ] Add "Restore defaults" button

### 9.5 Promotional Banner/Modal
- [ ] Create PromotionalBanner component
- [ ] Implement site-wide announcement bar
- [ ] Create PromotionalModal component for important announcements
- [ ] Add dismiss/don't show again options
- [ ] Wire up to get active promotions API endpoint
- [ ] Implement scheduling (start/end dates)
- [ ] Add A/B testing for banners/modals
- [ ] Add impression/click tracking

## 10. Coupon & Discount System (Charuka & Vidula)

### 10.1 Coupon Code Field in Cart/Checkout
- [ ] Add coupon field to CartPage and Checkout steps
- [ ] Implement apply/remove coupon buttons
- [ ] Add validation and error messaging
- [ ] Wire up to coupon validation API endpoint
- [ ] Implement auto-apply for visited coupon links
- [ ] Add coupon expiry and usage limit checks

### 10.2 Discount Application and Validation Messages
- [ ] Enhance cart/checkout to show discount breakdown
- [ ] Implement discount visibility in price summary
- [ ] Add messaging for coupon requirements not met
- [ ] Wire up to discount calculation API
- [ ] Add coupon expiration warnings
- [ ] Implement tiered/multi-discount handling

### 10.3 Coupon Management Interface (For Admins)
- [ ] Create AdminCouponsPage component
- [ ] Implement coupon list with filtering (active, expired, usage)
- [ ] Add create/edit coupon form:
  - Code, description, discount type/value
  - Usage limits (total, per user)
  - Product/category restrictions
  - Date range and scheduling
  - Minimum purchase requirements
- [ ] Wire up to coupon management API endpoints
- [ ] Add coupon performance analytics
- [ ] Add bulk import/export functionality
- [ ] Add coupon testing/validation tools

### 10.4 Promotional Badges on Products
- [ ] Create DiscountBadge component
- [ ] Implement badge types: sale, new, featured, coupon eligible
- [ ] Wire up to get product badges API endpoint
- [ ] Add badge positioning and styling (per wireframes)
- [ ] Implement hover tooltips with discount details
- [ ] Add animation for new/badged products
- [ ] Wire up to promotional rules API

## Implementation Dependencies and Notes

### Cross-Cutting Concerns
- [ ] Implement consistent header/footer navigation across all pages
- [ ] Add loading states and skeleton UIs for asynchronous data
- [ ] Implement error boundaries and fallback UIs
- [ ] Add form validation library (Yup, Formik, or custom)
- [ ] Implement consistent button styles and states
- [ ] Add responsive breakpoints testing (mobile <768px, tablet 768-1024px, desktop >1024px)
- [ ] Implement accessibility features (ARIA labels, keyboard navigation, focus management)
- [ ] Add SEO meta tags and structured data where applicable
- [ ] Implement analytics tracking (page views, events, conversions)
- [ ] Add error logging and monitoring integration

### API Dependencies
- [ ] Ensure all required API endpoints are implemented in backend
- [ ] Add API service layer in frontend for consistent calls
- [ ] Implement authentication token handling (refresh, storage)
- [ ] Add request/response interceptors for logging and error handling
- [ ] Implement optimistic UI updates where appropriate
- [ ] Add retry mechanisms for failed requests
- [ ] Add request cancellation for navigation changes

### State Management
- [ ] Implement global state management (Context API, Redux, or Zustand)
- [ ] Add persistent state for cart, user preferences, etc.
- [ ] Implement state synchronization between tabs/windows
- [ ] Add state hydration from server-side rendering (if applicable)
- [ ] Implement devtools integration for state debugging

### Testing
- [ ] Write unit tests for components and hooks
- [ ] Implement integration tests for critical user flows
- [ ] Add end-to-end tests (Cypress or Playwright) for:
  - User registration and login
  - Product search and purchase
  - Seller product upload
  - Admin moderation workflow
- [ ] Implement visual regression testing for UI consistency
- [ ] Add performance testing benchmarks

## Completion Tracking

### Priority 1 - Core Shopping Experience (Weeks 1-2)
- [x] Product Detail Page (basic implementation)
- [x] Enhanced Catalog/Search with filters (basic implementation)
- [ ] Shopping Cart (enhanced)
- [ ] Checkout Flow (basic)
- [ ] Order Confirmation

### Priority 2 - User Accounts & Payments (Weeks 3-4)
- [ ] Enhanced Authentication Flow
- [ ] Order History/Detail
- [ ] Payment Processing Integration
- [ ] Wishlist/Save for Later
- [ ] User Profile Management

### Priority 3 - Seller & Admin Features (Weeks 5-6)
- [ ] Seller Dashboard Overview
- [ ] Product Upload Flow
- [ ] Seller Order Management
- [ ] Admin Dashboard Overview
- [ ] User Management (Admin)

### Priority 4 - Engagement & Retention Features (Weeks 7-8)
- [ ] Review System
- [ ] Notification System
- [ ] Coupon/Discount System
- [ ] AI Chatbot Enhancements
- [ ] Promotional Banners/Modals
- [ ] Analytics & Reporting

---
*Last Updated: 2026-10-06*
*Based on wireframes.md documentation*
*This is a living document - update as implementation progresses*