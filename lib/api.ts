const API_BASE_URL = "http://19429ba06ff2.vps.myjino.ru/api";
const COMMAND_ID = "otus-em";

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

type ProductsFilters = {
  name?: string;
  pagination?: {
    pageSize?: number;
    pageNumber?: number;
  };
  sorting?: Sorting;
};

type SignUpBody = {
  email: string;
  password: string;
  commandId: string;
};

type SignInBody = {
  email: string;
  password: string;
};

type UpdateProfileBody = {
  name: string;
};

type ChangePasswordBody = {
  password: string;
  newPassword: string;
};

type ChangePasswordResult = {
  success: boolean;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH";
  token?: string;
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers();

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

async function getErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string; error?: string };
    return data.message ?? data.error ?? "Запрос завершился с ошибкой";
  } catch {
    return "Запрос завершился с ошибкой";
  }
}

function toSearchParams(filters: Record<string, unknown>) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    params.set(
      key,
      typeof value === "string" ? value : JSON.stringify(value)
    );
  });

  return params.toString();
}

export function signUp(email: string, password: string) {
  const body: SignUpBody = {
    email,
    password,
    commandId: COMMAND_ID,
  };

  return request<AuthResult>("/signup", {
    method: "POST",
    body,
  });
}

export function signIn(email: string, password: string) {
  const body: SignInBody = {
    email,
    password,
  };

  return request<AuthResult>("/signin", {
    method: "POST",
    body,
  });
}

export function getProfile(token: string) {
  return request<Profile>("/profile", {
    token,
  });
}

export function updateProfile(token: string, name: string) {
  const body: UpdateProfileBody = {
    name,
  };

  return request<Profile>("/profile", {
    method: "PATCH",
    token,
    body,
  });
}

export function changePassword(
  token: string,
  password: string,
  newPassword: string
) {
  const body: ChangePasswordBody = {
    password,
    newPassword,
  };

  return request<ChangePasswordResult>("/profile/change-password", {
    method: "POST",
    token,
    body,
  });
}

export function getProducts(filters: ProductsFilters = {}, token?: string) {
  const search = toSearchParams(filters);
  const path = search ? `/products?${search}` : "/products";

  return request<ListResponse<Product>>(path, {
    token,
  });
}
