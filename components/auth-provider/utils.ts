import { AUTH_REQUIRED_MESSAGE } from "@/components/auth-provider/constants";

export function getAuthRequiredError() {
  return new Error(AUTH_REQUIRED_MESSAGE);
}
