import { ApiError, hasRequestErrorCode } from "@/lib/api";
import { ErrorCode } from "@/lib/api/constants";

export function getSignInErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return error.message;
    }

    if (
      hasRequestErrorCode(error, ErrorCode.IncorrectEmailOrPassword) ||
      hasRequestErrorCode(error, ErrorCode.Auth)
    ) {
      return "Неверный email или пароль. Проверьте данные и попробуйте снова.";
    }

    if (error.status >= 500) {
      return "Сервер авторизации временно недоступен. Попробуйте позже.";
    }

    return error.message;
  }

  return "Не удалось войти в аккаунт. Попробуйте еще раз.";
}
