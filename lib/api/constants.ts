import type { OrderStatus } from "@/lib/api/types";

export const API_BASE_URL = "http://19429ba06ff2.vps.myjino.ru/api";
export const COMMAND_ID = "otus-em";

export const ORDER_STATUSES = [
  "pending_confirmation",
] as const satisfies readonly OrderStatus[];

export enum ErrorCode {
  IncorrectEmailOrPassword = "ERR_INCORRECT_EMAIL_OR_PASSWORD",
  AccountAlreadyExist = "ERR_ACCOUNT_ALREADY_EXIST",
  FieldRequired = "ERR_FIELD_REQUIRED",
  IncorrectPassword = "ERR_INCORRECT_PASSWORD",
  InvalidPassword = "ERR_INVALID_PASSWORD",
  NotValid = "ERR_NOT_VALID",
  Auth = "ERR_AUTH",
  NoFiles = "ERR_NO_FILES",
  NotAllowed = "ERR_NOT_ALLOWED",
  NotFound = "ERR_NOT_FOUND",
  ValidationError = "ERR_VALIDATION_ERROR",
  InvalidQueryParams = "ERR_INVALID_QUERY_PARAMS",
  InternalServer = "ERR_INTERNAL_SERVER",
}
