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
  categoryIds?: string[];
  pagination?: {
    pageSize?: number;
    pageNumber?: number;
  };
  sorting?: Sorting;
};

type CategoriesFilters = {
  name?: string;
  pagination?: {
    pageSize?: number;
    pageNumber?: number;
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
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string;
  body?: unknown;
};

export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  status: number;
  fieldErrors: FieldErrors;

  constructor(message: string, status: number, fieldErrors: FieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function getRequestErrorMessage(
  error: unknown,
  fallbackMessage = "Запрос завершился с ошибкой."
) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export function getRequestFieldErrors(error: unknown): FieldErrors {
  if (error instanceof ApiError) {
    return error.fieldErrors;
  }

  return {};
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers();

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Не удалось подключиться к серверу. Проверьте интернет и попробуйте еще раз.",
      0
    );
  }

  if (!response.ok) {
    const errorInfo = await getErrorInfo(response);
    throw new ApiError(
      errorInfo.message,
      response.status,
      errorInfo.fieldErrors
    );
  }

  return response.json() as Promise<T>;
}

async function getErrorInfo(response: Response) {
  try {
    const data = await response.json();
    const fieldErrors = getFieldErrors(data);
    const message = getMessage(data);

    return {
      message: message ?? getDefaultErrorMessage(response.status),
      fieldErrors,
    };
  } catch {
    return {
      message: getDefaultErrorMessage(response.status),
      fieldErrors: {},
    };
  }
}

function getMessage(data: unknown) {
  if (!isRecord(data)) {
    return undefined;
  }

  const message = data.message;
  const error = data.error;

  if (typeof message === "string") {
    return message;
  }

  if (Array.isArray(message)) {
    const messages = message
      .map((item) =>
        typeof item === "string"
          ? item
          : isRecord(item) && typeof item.message === "string"
            ? item.message
            : undefined
      )
      .filter(Boolean);

    return messages.length ? messages.join(". ") : undefined;
  }

  if (typeof error === "string") {
    return error;
  }

  return undefined;
}

function getFieldErrors(data: unknown): FieldErrors {
  const fieldErrors: FieldErrors = {};

  collectFieldErrors(data, fieldErrors);

  return fieldErrors;
}

function collectFieldErrors(data: unknown, fieldErrors: FieldErrors) {
  if (Array.isArray(data)) {
    data.forEach((item) => collectFieldErrors(item, fieldErrors));
    return;
  }

  if (!isRecord(data)) {
    return;
  }

  const fieldName = data.fieldName ?? data.field ?? data.property;
  const message = data.message ?? data.error;

  if (typeof fieldName === "string") {
    const normalizedMessage = Array.isArray(message)
      ? message.filter((item) => typeof item === "string").join(". ")
      : typeof message === "string"
        ? message
        : "Проверьте значение поля.";

    fieldErrors[fieldName] = normalizedMessage;
  }

  if (Array.isArray(data.errors)) {
    collectFieldErrors(data.errors, fieldErrors);
  }

  if (Array.isArray(data.message)) {
    collectFieldErrors(data.message, fieldErrors);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getDefaultErrorMessage(status: number) {
  if (status === 400) {
    return "Проверьте введенные данные и попробуйте еще раз.";
  }

  if (status === 401) {
    return "Нужно войти в аккаунт или обновить сессию.";
  }

  if (status === 403) {
    return "У вас нет доступа к этому действию.";
  }

  if (status === 404) {
    return "Запрошенные данные не найдены.";
  }

  if (status >= 500) {
    return "Сервер временно недоступен. Попробуйте позже.";
  }

  return "Запрос завершился с ошибкой.";
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

export function getProduct(id: string, token?: string) {
  return request<Product>(`/products/${id}`, {
    token,
  });
}

export function createProduct(token: string, body: ProductBody) {
  return request<Product>("/products", {
    method: "POST",
    token,
    body,
  });
}

export function updateProduct(token: string, id: string, body: ProductBody) {
  return request<Product>(`/products/${id}`, {
    method: "PATCH",
    token,
    body,
  });
}

export function getCategories(filters: CategoriesFilters = {}, token?: string) {
  const search = toSearchParams(filters);
  const path = search ? `/categories?${search}` : "/categories";

  return request<ListResponse<Category>>(path, {
    token,
  });
}

export function getCategory(id: string, token?: string) {
  return request<Category>(`/categories/${id}`, {
    token,
  });
}

export function createCategory(token: string, body: CategoryBody) {
  return request<Category>("/categories", {
    method: "POST",
    token,
    body,
  });
}

export function updateCategory(token: string, id: string, body: CategoryBody) {
  return request<Category>(`/categories/${id}`, {
    method: "PATCH",
    token,
    body,
  });
}
