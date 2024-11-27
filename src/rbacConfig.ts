export const Permissions = {
  // User permissions
  VIEW_ALL_USERS: "VIEW_ALL_USERS",
  UPDATE_USER: "UPDATE_USER",
  DELETE_USER: "DELETE_USER",
  UPDATE_OWN_USER: "UPDATE_OWN_USER",
  DELETE_OWN_USER: "DELETE_OWN_USER",

  // Product permissions
  CREATE_PRODUCT: "CREATE_PRODUCT",
  UPDATE_PRODUCT: "UPDATE_PRODUCT",
  DELETE_PRODUCT: "DELETE_PRODUCT",

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
    Permissions.VIEW_ALL_USERS,
    Permissions.UPDATE_USER,
    Permissions.DELETE_USER,
    // product
    Permissions.CREATE_PRODUCT,
    Permissions.UPDATE_PRODUCT,
    Permissions.DELETE_PRODUCT,
    // order
    Permissions.VIEW_ALL_ORDERS,
    Permissions.CREATE_ORDER,
    Permissions.UPDATE_ORDER,
    Permissions.DELETE_ORDER,
  ],
  staff: [
    // order
    Permissions.VIEW_ALL_ORDERS,
    Permissions.UPDATE_ORDER,
    // product
    Permissions.CREATE_PRODUCT,
    Permissions.UPDATE_PRODUCT,
    Permissions.DELETE_PRODUCT,
    // cart
    Permissions.VIEW_CART,
  ],
  customer: [
    // order
    Permissions.VIEW_OWN_ORDERS,
    Permissions.CREATE_OWN_ORDER,
    Permissions.UPDATE_OWN_ORDER,
    // cart
    Permissions.VIEW_OWN_CART,
    Permissions.CREATE_OWN_CART,
    Permissions.UPDATE_OWN_CART,
    Permissions.DELETE_OWN_CART,
  ],
  supplier: [
    // product
    Permissions.CREATE_PRODUCT,
    Permissions.UPDATE_PRODUCT,
    Permissions.DELETE_PRODUCT,
  ],
};
