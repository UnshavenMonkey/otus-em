export type AuthResult = {
  token: string;
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  signUpDate: string;
  commandId: string;
};

export type Category = {
  id: string;
  name: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
  commandId: string;
};

export type Product = {
  id: string;
  name: string;
  photo?: string;
  desc?: string;
  createdAt: string;
  updatedAt: string;
  oldPrice?: number;
  price: number;
  commandId: string;
  category: Category;
};

export type OrderStatus = string;

export type OrderProduct =
  | (Product & {
      quantity?: number;
    })
  | {
      product: Product;
      quantity?: number;
    };

export type Order = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  products?: OrderProduct[];
  productIds?: string[];
};

export type Pagination = {
  pageSize: number;
  pageNumber: number;
  total: number;
};

export type Sorting = {
  type: "ASC" | "DESC";
  field: "id" | "createdAt" | "updatedAt" | "name" | "date";
};

export type ListResponse<T> = {
  data: T[];
  pagination: Pagination;
  sorting?: Sorting;
};

export type ProductsFilters = {
  name?: string;
  categoryIds?: string[];
  pagination?: {
    pageSize?: number;
    pageNumber?: number;
  };
  sorting?: Sorting;
};

export type CategoriesFilters = {
  name?: string;
  pagination?: {
    pageSize?: number;
    pageNumber?: number;
  };
  sorting?: Sorting;
};

export type OrdersFilters = {
  productIds?: string[];
  userId?: string;
  ids?: string[];
  status?: OrderStatus;
  pagination?: {
    pageSize?: number;
    pageNumber?: number;
  };
  createdAt?: {
    gte?: string;
    lte?: string;
  };
  updatedAt?: {
    gte?: string;
    lte?: string;
  };
  sorting?: Sorting;
};

export type ProductBody = {
  name: string;
  photo?: string;
  desc?: string;
  oldPrice?: number;
  price: number;
  categoryId: string;
};

export type CategoryBody = {
  name: string;
  photo?: string;
};

export type OrderBody = {
  products: Array<{
    id: string;
    quantity: number;
  }>;
  status?: OrderStatus;
};

export type UpdateOrderBody = {
  productIds?: string[];
  status?: OrderStatus;
};

export type SignUpBody = {
  email: string;
  password: string;
  commandId: string;
};

export type SignInBody = {
  email: string;
  password: string;
};

export type UpdateProfileBody = {
  name: string;
};

export type ChangePasswordBody = {
  password: string;
  newPassword: string;
};

export type ChangePasswordResult = {
  success: boolean;
};

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string;
  body?: unknown;
};

export type FieldErrors = Record<string, string>;
