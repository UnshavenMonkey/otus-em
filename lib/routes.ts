export const AppRoutes = {
  Home: "/",
  Cart: "/cart",
  Orders: "/orders",
  Categories: "/categories",
  CategoryNew: "/categories/new",
  CategoryEdit: (id: string) => `/categories/${id}/edit`,
  ProductsNew: "/products/new",
  ProductEdit: (id: string) => `/products/${id}/edit`,
  Profile: "/profile",
  SignIn: "/signin",
  SignUp: "/signup",
} as const;
