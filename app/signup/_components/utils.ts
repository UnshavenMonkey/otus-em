import { ApiError, hasRequestErrorCode } from "@/lib/api";
import { ErrorCode } from "@/lib/api/constants";

export function getSignUpErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return error.message;
    }

    if (hasRequestErrorCode(error, ErrorCode.AccountAlreadyExist)) {
      return "Аккаунт с таким email уже существует. Попробуйте войти.";
    }

    if (hasRequestErrorCode(error, ErrorCode.InvalidPassword)) {
      return "Пароль должен быть не короче 8 символов и может содержать латинские буквы, цифры и спецсимволы.";
    }

    if (
      hasRequestErrorCode(error, ErrorCode.FieldRequired) ||
      hasRequestErrorCode(error, ErrorCode.ValidationError)
    ) {
      return "Проверьте email и пароль и попробуйте снова.";
    }

    if (error.status >= 500) {
      return "Сервер регистрации временно недоступен. Попробуйте позже.";
    }

    return error.message;
  }

  return "Не удалось зарегистрироваться. Попробуйте еще раз.";
}
