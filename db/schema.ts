import { text, integer, pgTable, real, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  role: text("role").default("USER").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const paymentMethods = pgTable("payment_methods", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(), // 'qris' | 'transfer'
  label: text("label").notNull(),
  accountName: text("account_name"),
  accountNumber: text("account_number"),
  qrisImageUrl: text("qris_image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: text("category").notNull(), // scent family: Fresh, Floral, Woody, Amber
  brand: text("brand").default("-").notNull(),
  gender: text("gender").default("Unisex").notNull(), // Men, Women, Unisex
  price: real("price").notNull(),
  description: text("description"),
  image: text("image"),
  sizes: text("sizes").notNull(), // e.g. "10ml,30ml,50ml,100ml"
  stockData: text("stock_data").default("{}").notNull(), // JSON string for size-level stock
  stock: integer("stock").default(0).notNull(),
  tags: text("tags").default("").notNull(),
  isBestSeller: boolean("is_best_seller").default(false).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  warPrice: real("war_price"),
  launchedAt: timestamp("launched_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  order: integer("order").default(0).notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  paymentMethodId: uuid("payment_method_id").references(() => paymentMethods.id, { onDelete: 'set null' }),
  total: real("total").notNull(),
  status: text("status").default("PENDING").notNull(), // PENDING | PAID | PROCESSING | SHIPPED | COMPLETED
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  shippingAddress: text("shipping_address"),
  shippingZone: text("shipping_zone"),
  ipAddress: text("ip_address"),
  giftWrap: boolean("gift_wrap").default(false),
  giftWrapNote: text("gift_wrap_note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  size: text("size").notNull(),
  price: real("price").notNull(),
  notes: text("notes"),
});

export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  role: text("role"),
  content: text("content").notNull(),
  rating: integer("rating").default(5).notNull(),
  avatar: text("avatar"),
  proofImage: text("proof_image"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const banners = pgTable("banners", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title"),
  image: text("image").notNull(),
  link: text("link"),
  active: boolean("active").default(true).notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const wars = pgTable("wars", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  active: boolean("active").default(true).notNull(),
  converted: boolean("converted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const warItems = pgTable("war_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  warId: uuid("war_id").notNull().references(() => wars.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  brand: text("brand").default("-").notNull(),
  category: text("category").default("Fresh").notNull(),
  gender: text("gender").default("Unisex").notNull(),
  price: real("price").notNull(),
  sizes: text("sizes").default("50ml").notNull(),
  stock: integer("stock").notNull(),
  image: text("image"),
  productId: uuid("product_id").references(() => products.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  category: text("category"), // Care Tips, Scent Guide, News, Recommendation
  tags: text("tags").default("").notNull(),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

// RELATIONS
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [orders.paymentMethodId],
    references: [paymentMethods.id],
  }),
  items: many(orderItems),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ many }) => ({
  orders: many(orders),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  images: many(productImages),
  items: many(orderItems),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const warsRelations = relations(wars, ({ many }) => ({
  items: many(warItems),
}));

export const warItemsRelations = relations(warItems, ({ one }) => ({
  war: one(wars, {
    fields: [warItems.warId],
    references: [wars.id],
  }),
  product: one(products, {
    fields: [warItems.productId],
    references: [products.id],
  }),
}));
