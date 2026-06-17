export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

export function ok<T>(data: T): Response {
  return Response.json({ data, error: null } satisfies ApiResponse<T>);
}

export function fail(message: string, status = 400): Response {
  return Response.json({ data: null, error: message } satisfies ApiResponse<never>, { status });
}
