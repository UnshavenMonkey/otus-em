import { API_BASE_URL, COMMAND_ID, ErrorCode } from "@/lib/api/constants";
import type {
  AuthResult,
  CategoriesFilters,
  Category,
  CategoryBody,
  ChangePasswordBody,
  ChangePasswordResult,
  FieldErrors,
  ListResponse,
  Order,
  OrderBody,
  OrdersFilters,
  Product,
  ProductBody,
  ProductsFilters,
  Profile,
  RequestOptions,
  SignInBody,
  SignUpBody,
  UpdateOrderBody,
  UpdateProfileBody,
} from "@/lib/api/types";

export class ApiError extends Error {
  status: number;
  fieldErrors: FieldErrors;
  codes: ErrorCode[];

  constructor(
    message: string,
    status: number,
    fieldErrors: FieldErrors = {},
    codes: ErrorCode[] = []
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.codes = codes;
  }
}

export function hasRequestErrorCode(error: unknown, code: ErrorCode) {
  return error instanceof ApiError && error.codes.includes(code);
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
      errorInfo.fieldErrors,
      errorInfo.codes
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
      codes: getErrorCodes(data),
    };
  } catch {
    return {
      message: getDefaultErrorMessage(response.status),
      fieldErrors: {},
      codes: [],
    };
  }
}

function getMessage(data: unknown) {
  if (!isRecord(data)) {
    return undefined;
  }

  const message = data.message;
  const error = data.error;
  const errors = data.errors;

  if (Array.isArray(errors)) {
    const messages = errors
      .map((item) =>
        isRecord(item) && typeof item.message === "string"
          ? item.message
          : undefined
      )
      .filter(Boolean);

    if (messages.length) {
      return messages.join(". ");
    }
  }

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

function getErrorCodes(data: unknown): ErrorCode[] {
  if (!isRecord(data) || !Array.isArray(data.errors)) {
    return [];
  }

  return data.errors
    .map((error) => {
      if (!isRecord(error) || !isRecord(error.extensions)) {
        return undefined;
      }

      const code = error.extensions.code;

      return isErrorCode(code) ? code : undefined;
    })
    .filter((code): code is ErrorCode => Boolean(code));
}

function isErrorCode(value: unknown): value is ErrorCode {
  return (
    typeof value === "string" &&
    Object.values(ErrorCode).includes(value as ErrorCode)
  );
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

    params.set(key, JSON.stringify(value));
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

export function getOrders(filters: OrdersFilters = {}, token?: string) {
  const search = toSearchParams(filters);
  const path = search ? `/orders?${search}` : "/orders";

  return request<ListResponse<Order>>(path, {
    token,
  });
}

export function getOrder(id: string, token?: string) {
  return request<Order>(`/orders/${id}`, {
    token,
  });
}

export function createOrder(token: string, body: OrderBody) {
  return request<Order>("/orders", {
    method: "POST",
    token,
    body,
  });
}

export function updateOrder(token: string, id: string, body: UpdateOrderBody) {
  return request<Order>(`/orders/${id}`, {
    method: "PATCH",
    token,
    body,
  });
}

export function deleteOrder(token: string, id: string) {
  return request<Order>(`/orders/${id}`, {
    method: "DELETE",
    token,
  });
}
