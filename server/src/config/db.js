import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import userFactory from '../models/User.js';
import categoryFactory from '../models/Category.js';
import materialFactory from '../models/Material.js';
import cartFactory from '../models/Cart.js';
import cartItemFactory from '../models/CartItem.js';
import couponFactory from '../models/Coupon.js';
import searchHistoryFactory from '../models/SearchHistory.js';
import savedSearchFactory from '../models/SavedSearch.js';
import orderFactory from '../models/Order.js';
import orderItemFactory from '../models/OrderItem.js';
import notificationFactory from '../models/Notification.js';
import reviewFactory from '../models/Review.js';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'edumart',
  process.env.DB_USER || 'edumart_user',
  process.env.DB_PASSWORD || 'edumart_password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

// Initialize models
const User = userFactory(sequelize, Sequelize.DataTypes);
const Category = categoryFactory(sequelize, Sequelize.DataTypes);
const Material = materialFactory(sequelize, Sequelize.DataTypes);
const Cart = cartFactory(sequelize, Sequelize.DataTypes);
const CartItem = cartItemFactory(sequelize, Sequelize.DataTypes);
const Coupon = couponFactory(sequelize, Sequelize.DataTypes);
const SearchHistory = searchHistoryFactory(sequelize, Sequelize.DataTypes);
const SavedSearch = savedSearchFactory(sequelize, Sequelize.DataTypes);
const Order = orderFactory(sequelize, Sequelize.DataTypes);
const OrderItem = orderItemFactory(sequelize, Sequelize.DataTypes);
const Notification = notificationFactory(sequelize, Sequelize.DataTypes);
const Review = reviewFactory(sequelize, Sequelize.DataTypes);

// Call associate methods
[User, Category, Material, Cart, CartItem, Coupon, SearchHistory, SavedSearch, Order, OrderItem, Notification, Review].forEach(model => {
  if (model.associate) {
    model.associate({
      User,
      Category,
      Material,
      Cart,
      CartItem,
      Coupon,
      SearchHistory,
      SavedSearch,
      Order,
      OrderItem,
      Notification,
      Review,
    });
  }
});

export { sequelize };
export default sequelize;
