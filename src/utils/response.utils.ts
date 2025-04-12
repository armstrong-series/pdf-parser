export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  error?: string;
}

export function sendResponse<T>(
  data: T,
  message = 'Request completed!',
): ApiResponse<T> {
  return {
    status: 'success',
    message,
    data,
  };
}

export function createErrorResponse<T>(
  message: string,
  error?: string,
): ApiResponse<T> {
  return {
    status: 'error',
    message,
    error,
  };
}
