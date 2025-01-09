export const permissions = {
  // User permissions
  VIEW_ALL_USERS: "VIEW_ALL_USERS",
  CREATE_USER: "CREATE_USER",
  VIEW_USER: "VIEW_USER",
  VIEW_OWN_USER: "VIEW_OWN_USER",
  UPDATE_USER: "UPDATE_USER",
  DELETE_USER: "DELETE_USER",
  UPDATE_OWN_USER: "UPDATE_OWN_USER",
  DELETE_OWN_USER: "DELETE_OWN_USER",

  // Product permissions
  CREATE_PRODUCT: "CREATE_PRODUCT",
  UPDATE_PRODUCT: "UPDATE_PRODUCT",
  DELETE_PRODUCT: "DELETE_PRODUCT",

  // category permissions
  CREATE_CATEGORY: "CREATE_CATEGORY",
  UPDATE_CATEGORY: "UPDATE_CATEGORY",
  DELETE_CATEGORY: "DELETE_CATEGORY",

  // Group permissions
  CREATE_GROUP: "CREATE_GROUP",
  UPDATE_GROUP: "UPDATE_GROUP",
  DELETE_GROUP: "DELETE_GROUP",

  // Order permissions
  VIEW_ALL_ORDERS: "VIEW_ALL_ORDERS",
  CREATE_ORDER: "CREATE_ORDER",
  UPDATE_ORDER: "UPDATE_ORDER",
  DELETE_ORDER: "DELETE_ORDER",
  VIEW_OWN_ORDERS: "VIEW_OWN_ORDERS",
  CREATE_OWN_ORDER: "CREATE_OWN_ORDER",
  UPDATE_OWN_ORDER: "UPDATE_OWN_ORDER",

  // Cart permissions
  VIEW_CART: "VIEW_CART",
  VIEW_OWN_CART: "VIEW_OWN_CART",
  CREATE_OWN_CART: "CREATE_OWN_CART",
  UPDATE_OWN_CART: "UPDATE_OWN_CART",
  DELETE_OWN_CART: "DELETE_OWN_CART",
};

export const Roles = {
  admin: [
    // user
    permissions.VIEW_ALL_USERS,
    permissions.CREATE_USER,
    permissions.UPDATE_USER,
    permissions.DELETE_USER,
    permissions.VIEW_OWN_USER,
    // product
    permissions.CREATE_PRODUCT,
    permissions.UPDATE_PRODUCT,
    permissions.DELETE_PRODUCT,
    // category
    permissions.CREATE_CATEGORY,
    permissions.UPDATE_CATEGORY,
    permissions.DELETE_CATEGORY,
    // group
    permissions.CREATE_GROUP,
    permissions.UPDATE_GROUP,
    permissions.DELETE_GROUP,
    // order
    permissions.VIEW_ALL_ORDERS,
    permissions.CREATE_ORDER,
    permissions.UPDATE_ORDER,
    permissions.DELETE_ORDER,
    // cart
    permissions.VIEW_CART,
    permissions.VIEW_OWN_CART,
    permissions.CREATE_OWN_CART,
    permissions.UPDATE_OWN_CART,
    permissions.DELETE_OWN_CART,
  ],
  staff: [
    // product
    permissions.CREATE_PRODUCT,
    permissions.UPDATE_PRODUCT,
    permissions.DELETE_PRODUCT,
    permissions.VIEW_OWN_USER,
    // category
    permissions.CREATE_CATEGORY,
    permissions.UPDATE_CATEGORY,
    permissions.DELETE_CATEGORY,
    // group
    permissions.CREATE_GROUP,
    permissions.UPDATE_GROUP,
    permissions.DELETE_GROUP,
    // order
    permissions.VIEW_ALL_ORDERS,
    permissions.UPDATE_ORDER,
    // cart
    permissions.VIEW_CART,
  ],
  customer: [
    // order
    permissions.VIEW_OWN_ORDERS,
    permissions.CREATE_OWN_ORDER,
    permissions.UPDATE_OWN_ORDER,
    permissions.VIEW_OWN_USER,
    // cart
    permissions.VIEW_OWN_CART,
    permissions.CREATE_OWN_CART,
    permissions.UPDATE_OWN_CART,
    permissions.DELETE_OWN_CART,
  ],
  supplier: [
    // user
    permissions.VIEW_OWN_USER,
    // product
    permissions.CREATE_PRODUCT,
    permissions.UPDATE_PRODUCT,
    permissions.DELETE_PRODUCT,
  ],
};
