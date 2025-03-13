import { AxiosError } from "axios";

export const parseTaskValidationError = (error: AxiosError): string[] => {
  // Parse error response, assuming that it has the format like a Pydantic `RequestValidationError`
  // NOTE: The coupling of the error response to Pydantic is not ideal, but it is the current state of the API
  const errors = error.response?.data as Record<string, unknown>;
  if ("detail" in errors) {
    const errorDetails = errors.detail as Array<Record<string, unknown>>;
    return errorDetails
      .map((errorDetail) => {
        // NOTE: All validation errors are assumed to be have the prefix "Value error, "
        if ("msg" in errorDetail) return (errorDetail.msg as string).replace(/^Value error, /g, " ");
      })
      .filter((error) => error !== undefined);
  }
  return [];
};
