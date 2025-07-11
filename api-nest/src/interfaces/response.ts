export interface Response<T = any> {
  status: number;
  message: string;
  data?: T;
}

export function Response<T = any>(
  status: number,
  message: string,
  data?: T,
): Response<T> {
  return { status, message, data };
}
